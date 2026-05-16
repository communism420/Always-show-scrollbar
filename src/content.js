(() => {
  "use strict";

  const STORAGE_KEY = "enabledSites";
  const DEFAULT_ENABLED_SITES = ["*"];
  const STYLE_ID = "always-show-scrollbar-style";
  const SCROLLBAR_SIZE_PX = 16;
  const MAX_ELEMENTS_PER_SCAN = 1800;
  const EXISTING_SCROLL_OVERFLOW_VALUES = new Set(["auto", "scroll", "overlay"]);
  const MANAGED_PROPERTY_NAMES = [
    "overflow",
    "overflow-x",
    "overflow-y",
    "-ms-overflow-style",
    "scrollbar-width",
    "scrollbar-color",
    "scrollbar-gutter"
  ];
  const STANDARD_SCROLLBAR_PROPERTIES = [
    ["-ms-overflow-style", "scrollbar"],
    ["scrollbar-width", "auto"],
    ["scrollbar-color", "auto"]
  ];

  const rules = globalThis.AlwaysShowScrollbarRules;
  const originalInlineStyles = new WeakMap();
  const managedElements = new Set();

  let enabledForPage = false;
  let rootObserver = null;
  let headObserver = null;
  let bodyObserver = null;
  let observedHead = null;
  let observedBody = null;
  let scheduledFrame = 0;
  let scheduledScan = 0;
  let scheduledScanUsesIdleCallback = false;
  let userCssInserted = false;

  const scrollbarCss = `
    :root,
    html,
    body {
      -ms-overflow-style: scrollbar !important;
      scrollbar-width: auto !important;
      scrollbar-color: auto !important;
    }

    :host {
      -ms-overflow-style: scrollbar !important;
      scrollbar-width: auto !important;
      scrollbar-color: auto !important;
    }

    * {
      -ms-overflow-style: scrollbar !important;
      scrollbar-width: auto !important;
      scrollbar-color: auto !important;
    }

    html::-webkit-scrollbar,
    body::-webkit-scrollbar,
    *::-webkit-scrollbar {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: ${SCROLLBAR_SIZE_PX}px !important;
      height: ${SCROLLBAR_SIZE_PX}px !important;
    }

    html::-webkit-scrollbar:vertical,
    body::-webkit-scrollbar:vertical,
    *::-webkit-scrollbar:vertical {
      width: ${SCROLLBAR_SIZE_PX}px !important;
    }

    html::-webkit-scrollbar:horizontal,
    body::-webkit-scrollbar:horizontal,
    *::-webkit-scrollbar:horizontal {
      height: ${SCROLLBAR_SIZE_PX}px !important;
    }

    html::-webkit-scrollbar-button,
    body::-webkit-scrollbar-button,
    *::-webkit-scrollbar-button,
    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track,
    *::-webkit-scrollbar-track,
    html::-webkit-scrollbar-track-piece,
    body::-webkit-scrollbar-track-piece,
    *::-webkit-scrollbar-track-piece,
    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb,
    *::-webkit-scrollbar-thumb,
    html::-webkit-scrollbar-corner,
    body::-webkit-scrollbar-corner,
    *::-webkit-scrollbar-corner,
    html::-webkit-resizer,
    body::-webkit-resizer,
    *::-webkit-resizer {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track,
    *::-webkit-scrollbar-track,
    html::-webkit-scrollbar-track-piece,
    body::-webkit-scrollbar-track-piece,
    *::-webkit-scrollbar-track-piece,
    html::-webkit-scrollbar-corner,
    body::-webkit-scrollbar-corner,
    *::-webkit-scrollbar-corner {
      background-color: rgba(128, 128, 128, 0.18) !important;
    }

    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb,
    *::-webkit-scrollbar-thumb {
      min-width: 24px !important;
      min-height: 24px !important;
      border: 3px solid transparent !important;
      border-radius: 999px !important;
      background-color: rgba(96, 96, 96, 0.78) !important;
      background-clip: content-box !important;
    }

    html::-webkit-scrollbar-button,
    body::-webkit-scrollbar-button,
    *::-webkit-scrollbar-button,
    html::-webkit-resizer,
    body::-webkit-resizer,
    *::-webkit-resizer {
      background-color: rgba(128, 128, 128, 0.28) !important;
    }
  `;

  function getEnabledSites() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_ENABLED_SITES }, (items) => {
        if (chrome.runtime.lastError || !Array.isArray(items[STORAGE_KEY])) {
          resolve(DEFAULT_ENABLED_SITES);
          return;
        }

        resolve(items[STORAGE_KEY]);
      });
    });
  }

  function rememberInlineStyles(element) {
    if (!element || originalInlineStyles.has(element)) {
      return;
    }

    const snapshot = MANAGED_PROPERTY_NAMES.map((property) => ({
      property,
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property)
    }));

    originalInlineStyles.set(element, snapshot);
    managedElements.add(element);
  }

  function restoreInlineProperty(element, property) {
    const snapshot = originalInlineStyles.get(element);
    const original = snapshot?.find((item) => item.property === property);

    if (!original) {
      return;
    }

    if (original.value) {
      element.style.setProperty(property, original.value, original.priority);
    } else {
      element.style.removeProperty(property);
    }
  }

  function setImportantStyle(element, property, value) {
    if (
      element.style.getPropertyValue(property) === value &&
      element.style.getPropertyPriority(property) === "important"
    ) {
      return;
    }

    element.style.setProperty(property, value, "important");
  }

  function syncInlineScrollbarStyles(element, axes) {
    if (!element) {
      return;
    }

    rememberInlineStyles(element);

    // Inline important styles beat site-level overflow locks that are also important.
    if (axes.shorthand || (axes.x && axes.y)) {
      setImportantStyle(element, "overflow", "scroll");
    } else {
      restoreInlineProperty(element, "overflow");
    }

    if (axes.x) {
      setImportantStyle(element, "overflow-x", "scroll");
    } else {
      restoreInlineProperty(element, "overflow-x");
    }

    if (axes.y) {
      setImportantStyle(element, "overflow-y", "scroll");
    } else {
      restoreInlineProperty(element, "overflow-y");
    }

    for (const [property, value] of STANDARD_SCROLLBAR_PROPERTIES) {
      setImportantStyle(element, property, value);
    }
  }

  function restoreInlineScrollbarStyles(element) {
    const snapshot = originalInlineStyles.get(element);

    if (!element || !snapshot) {
      return;
    }

    for (const { property, value, priority } of snapshot) {
      if (value) {
        element.style.setProperty(property, value, priority);
      } else {
        element.style.removeProperty(property);
      }
    }

    originalInlineStyles.delete(element);
    managedElements.delete(element);
  }

  function getStyleHost() {
    return document.head || document.documentElement;
  }

  function ensureStylesheet(root = document) {
    const host = root === document ? getStyleHost() : root;
    const existingStyle = root === document
      ? document.getElementById(STYLE_ID)
      : root.getElementById?.(STYLE_ID);
    const style = existingStyle || document.createElement("style");

    if (!style.id) {
      style.id = STYLE_ID;
    }

    if (style.textContent !== scrollbarCss) {
      style.textContent = scrollbarCss;
    }

    // Keep our fallback stylesheet last so it wins when the site injects new author CSS.
    if (style.parentNode !== host || style.nextSibling) {
      host.append(style);
    }
  }

  function removeStylesheet() {
    document.getElementById(STYLE_ID)?.remove();
  }

  function insertUserStylesheet() {
    if (userCssInserted) {
      return;
    }

    userCssInserted = true;
    chrome.runtime.sendMessage({
      type: "INSERT_SCROLLBAR_USER_CSS",
      css: scrollbarCss
    }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        userCssInserted = false;
      }
    });
  }

  function removeUserStylesheet() {
    if (!userCssInserted) {
      return;
    }

    userCssInserted = false;
    chrome.runtime.sendMessage({
      type: "REMOVE_SCROLLBAR_USER_CSS",
      css: scrollbarCss
    });
  }

  function ensureShadowStyles(root) {
    if (!root) {
      return;
    }

    ensureStylesheet(root);
  }

  function getRootScrollbarAxes() {
    const root = document.documentElement;
    const body = document.body;
    const scrollingElement = document.scrollingElement || root;
    const scrollingStyle = getComputedStyle(scrollingElement);
    const rootStyle = getComputedStyle(root);
    const bodyStyle = body ? getComputedStyle(body) : null;
    const viewportWidth = root.clientWidth || window.innerWidth;
    const viewportHeight = root.clientHeight || window.innerHeight;
    const scrollWidth = Math.max(
      scrollingElement.scrollWidth,
      root.scrollWidth,
      body?.scrollWidth || 0
    );
    const scrollHeight = Math.max(
      scrollingElement.scrollHeight,
      root.scrollHeight,
      body?.scrollHeight || 0
    );
    const rootOverflowXValues = [
      scrollingStyle.overflowX,
      rootStyle.overflowX,
      bodyStyle?.overflowX
    ].filter(Boolean).map((value) => value.toLowerCase());
    const hasDeclaredHorizontalScroll = rootOverflowXValues.some((value) => {
      return EXISTING_SCROLL_OVERFLOW_VALUES.has(value);
    });

    return {
      x: scrollWidth > viewportWidth + 1 && hasDeclaredHorizontalScroll,
      // The page scrollbar should stay present on any genuinely scrollable document.
      y: scrollHeight > viewportHeight + 1,
      shorthand: false
    };
  }

  function applyRootScrollbarStyles() {
    const axes = getRootScrollbarAxes();
    const scrollingElement = document.scrollingElement || document.documentElement;

    if (!axes.x && !axes.y) {
      restoreInlineScrollbarStyles(scrollingElement);
      return;
    }

    // Only the real document scroller gets overflow forcing; this avoids fake page bars.
    syncInlineScrollbarStyles(scrollingElement, axes);
  }

  function getScrollbarAxes(element) {
    if (!element || element === document.documentElement || element === document.body) {
      return null;
    }

    const hasHorizontalOverflow = element.scrollWidth > element.clientWidth + 1;
    const hasVerticalOverflow = element.scrollHeight > element.clientHeight + 1;

    if (!hasHorizontalOverflow && !hasVerticalOverflow) {
      return null;
    }

    const computed = getComputedStyle(element);
    const overflowX = computed.overflowX.toLowerCase();
    const overflowY = computed.overflowY.toLowerCase();
    const canExposeHorizontal = hasHorizontalOverflow &&
      EXISTING_SCROLL_OVERFLOW_VALUES.has(overflowX);
    const canExposeVertical = hasVerticalOverflow &&
      EXISTING_SCROLL_OVERFLOW_VALUES.has(overflowY);

    if (!canExposeHorizontal && !canExposeVertical) {
      return null;
    }

    return {
      x: canExposeHorizontal,
      y: canExposeVertical,
      shorthand: canExposeHorizontal && canExposeVertical
    };
  }

  function scanRootForScrollableElements(root, state) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);

    while (state.visited < MAX_ELEMENTS_PER_SCAN) {
      const element = walker.nextNode();

      if (!element) {
        return;
      }

      state.visited += 1;

      if (element.shadowRoot) {
        ensureShadowStyles(element.shadowRoot);
        scanRootForScrollableElements(element.shadowRoot, state);
      }

      const axes = getScrollbarAxes(element);

      if (axes) {
        syncInlineScrollbarStyles(element, axes);
      } else if (originalInlineStyles.has(element)) {
        restoreInlineScrollbarStyles(element);
      }
    }
  }

  function scanScrollableElements() {
    if (!enabledForPage) {
      return;
    }

    const state = { visited: 0 };
    scanRootForScrollableElements(document, state);
  }

  function scheduleElementScan() {
    if (!enabledForPage || scheduledScan) {
      return;
    }

    const runScan = () => {
      scheduledScan = 0;
      scheduledScanUsesIdleCallback = false;
      scanScrollableElements();
    };

    if ("requestIdleCallback" in window) {
      scheduledScanUsesIdleCallback = true;
      scheduledScan = requestIdleCallback(runScan, { timeout: 600 });
      return;
    }

    scheduledScan = setTimeout(runScan, 80);
  }

  function enforceScrollbars() {
    if (!enabledForPage) {
      return;
    }

    insertUserStylesheet();
    ensureStylesheet();
    applyRootScrollbarStyles();
    observeHead();
    observeBody();
    scheduleElementScan();
  }

  function scheduleEnforce() {
    if (!enabledForPage || scheduledFrame) {
      return;
    }

    scheduledFrame = requestAnimationFrame(() => {
      scheduledFrame = 0;
      enforceScrollbars();
    });
  }

  function observeBody() {
    if (!document.body || observedBody === document.body) {
      return;
    }

    bodyObserver?.disconnect();
    observedBody = document.body;
    bodyObserver = new MutationObserver(scheduleEnforce);
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }

  function observeHead() {
    if (!document.head || observedHead === document.head) {
      return;
    }

    headObserver?.disconnect();
    observedHead = document.head;
    headObserver = new MutationObserver(scheduleEnforce);
    headObserver.observe(document.head, {
      childList: true
    });
  }

  function startObservers() {
    if (rootObserver) {
      return;
    }

    // Watch DOM and class/style changes, then throttle the expensive scroll-container scan.
    rootObserver = new MutationObserver(scheduleEnforce);
    rootObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    observeBody();
  }

  function stopObservers() {
    rootObserver?.disconnect();
    headObserver?.disconnect();
    bodyObserver?.disconnect();
    rootObserver = null;
    headObserver = null;
    bodyObserver = null;
    observedHead = null;
    observedBody = null;

    if (scheduledFrame) {
      cancelAnimationFrame(scheduledFrame);
      scheduledFrame = 0;
    }

    if (scheduledScan) {
      if (scheduledScanUsesIdleCallback && "cancelIdleCallback" in window) {
        cancelIdleCallback(scheduledScan);
      } else {
        clearTimeout(scheduledScan);
      }

      scheduledScan = 0;
      scheduledScanUsesIdleCallback = false;
    }
  }

  function enableForPage() {
    if (enabledForPage) {
      enforceScrollbars();
      return;
    }

    enabledForPage = true;
    enforceScrollbars();
    startObservers();
  }

  function disableForPage() {
    if (!enabledForPage) {
      return;
    }

    enabledForPage = false;
    stopObservers();
    removeUserStylesheet();
    removeStylesheet();

    for (const element of [...managedElements]) {
      restoreInlineScrollbarStyles(element);
    }
  }

  function applyRules(enabledSites) {
    if (rules.matchesLocation(enabledSites)) {
      enableForPage();
    } else {
      disableForPage();
    }
  }

  async function initialize() {
    applyRules(await getEnabledSites());

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", enforceScrollbars, { once: true });
    }
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes[STORAGE_KEY]) {
      return;
    }

    applyRules(changes[STORAGE_KEY].newValue);
  });

  initialize();
})();
