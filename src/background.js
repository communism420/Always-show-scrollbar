(() => {
  "use strict";

  const STORAGE_KEY = "enabledSites";
  const DEFAULT_ENABLED_SITES = ["*"];
  const CSS_MESSAGE_TYPES = new Set([
    "INSERT_SCROLLBAR_USER_CSS",
    "REMOVE_SCROLLBAR_USER_CSS"
  ]);

  // Keep a sane default so the extension works immediately after installation.
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(STORAGE_KEY, (items) => {
      if (!Array.isArray(items[STORAGE_KEY])) {
        chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULT_ENABLED_SITES });
      }
    });
  });

  function handleUserCssMessage(message, sender, sendResponse) {
    if (!sender.tab?.id || typeof sender.frameId !== "number" || typeof message.css !== "string") {
      sendResponse({ ok: false, error: "Missing tab, frame, or CSS payload." });
      return true;
    }

    const target = {
      tabId: sender.tab.id,
      frameIds: [sender.frameId]
    };

    const options = {
      target,
      css: message.css,
      origin: "USER"
    };

    const callback = () => {
      const error = chrome.runtime.lastError?.message;
      sendResponse({ ok: !error, error });
    };

    if (message.type === "INSERT_SCROLLBAR_USER_CSS") {
      chrome.scripting.insertCSS(options, callback);
      return true;
    }

    chrome.scripting.removeCSS(options, callback);
    return true;
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (CSS_MESSAGE_TYPES.has(message?.type)) {
      return handleUserCssMessage(message, _sender, sendResponse);
    }

    if (message?.type !== "GET_ENABLED_SITES") {
      return false;
    }

    chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_ENABLED_SITES }, (items) => {
      sendResponse({ enabledSites: items[STORAGE_KEY] });
    });

    return true;
  });
})();
