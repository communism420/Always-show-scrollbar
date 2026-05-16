(() => {
  "use strict";

  const STORAGE_KEY = "enabledSites";
  const DEFAULT_ENABLED_SITES = ["*"];
  const { normalizeRule, normalizeRules } = globalThis.AlwaysShowScrollbarRules;
  const i18n = globalThis.AlwaysShowScrollbarI18n;

  const addForm = document.getElementById("addForm");
  const siteInput = document.getElementById("siteInput");
  const siteList = document.getElementById("siteList");
  const status = document.getElementById("status");
  const emptyState = document.getElementById("emptyState");
  const resetAll = document.getElementById("resetAll");
  const ruleCount = document.getElementById("ruleCount");
  const quickRules = document.querySelectorAll("[data-example]");
  const languageSelect = document.getElementById("languageSelect");

  let enabledSites = [];
  let currentLanguage = i18n.DEFAULT_LANGUAGE;
  let translate = i18n.createTranslator(currentLanguage);
  let statusTimer = 0;

  function setStatus(message, isError = false) {
    window.clearTimeout(statusTimer);
    status.textContent = message;
    status.classList.toggle("error", isError);

    if (!isError && message) {
      statusTimer = window.setTimeout(() => {
        status.textContent = "";
      }, 2400);
    }
  }

  function getStoredSites() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_ENABLED_SITES }, (items) => {
        if (chrome.runtime.lastError || !Array.isArray(items[STORAGE_KEY])) {
          resolve(DEFAULT_ENABLED_SITES);
          return;
        }

        resolve(normalizeRules(items[STORAGE_KEY]));
      });
    });
  }

  function saveSites(nextSites) {
    return new Promise((resolve, reject) => {
      const normalizedSites = normalizeRules(nextSites);

      chrome.storage.sync.set({ [STORAGE_KEY]: normalizedSites }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        enabledSites = normalizedSites;
        renderSites();
        setStatus(translate("saved"));
        resolve();
      });
    });
  }

  function validateRule(value, existingIndex = -1) {
    const normalized = normalizeRule(value);

    if (!normalized) {
      return { error: translate("invalidRule") };
    }

    const duplicateIndex = enabledSites.findIndex((site, index) => {
      return index !== existingIndex && site === normalized;
    });

    if (duplicateIndex !== -1) {
      return { error: translate("duplicateRule") };
    }

    return { normalized };
  }

  function describeRule(site) {
    if (site === "*") {
      return {
        label: translate("allSites"),
        className: "all",
        description: translate("ruleAllDescription")
      };
    }

    if (site === "file://") {
      return {
        label: translate("localFiles"),
        className: "local",
        description: translate("ruleLocalDescription")
      };
    }

    if (site.startsWith("*.")) {
      return {
        label: translate("wildcard"),
        className: "wildcard",
        description: translate("ruleWildcardDescription")
      };
    }

    return {
      label: translate("ruleDomain"),
      className: "domain",
      description: translate("ruleDomainDescription")
    };
  }

  function createSiteRow(site, index) {
    const ruleInfo = describeRule(site);
    const row = document.createElement("li");
    row.className = "site-row";
    row.dataset.index = String(index);

    const main = document.createElement("div");
    main.className = "rule-main";

    const badge = document.createElement("span");
    badge.className = `rule-badge ${ruleInfo.className}`;
    badge.textContent = ruleInfo.label;

    const copy = document.createElement("div");
    copy.className = "rule-copy";

    const input = document.createElement("input");
    input.type = "text";
    input.value = site;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", translate("siteRuleLabel"));

    const description = document.createElement("p");
    description.className = "rule-description";
    description.textContent = ruleInfo.description;

    const actions = document.createElement("div");
    actions.className = "rule-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "secondary-button";
    saveButton.dataset.action = "save";
    saveButton.textContent = translate("update");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger-button";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = translate("remove");

    copy.append(input, description);
    main.append(badge, copy);
    actions.append(saveButton, deleteButton);
    row.append(main, actions);
    return row;
  }

  function renderSites() {
    siteList.replaceChildren(...enabledSites.map(createSiteRow));
    emptyState.hidden = enabledSites.length > 0;
    ruleCount.textContent = String(enabledSites.length);
  }

  async function addSite(value) {
    const result = validateRule(value);

    if (result.error) {
      setStatus(result.error, true);
      return;
    }

    await saveSites([...enabledSites, result.normalized]);
    siteInput.value = "";
    siteInput.focus();
  }

  async function updateSite(index, value) {
    const result = validateRule(value, index);

    if (result.error) {
      setStatus(result.error, true);
      return;
    }

    const nextSites = [...enabledSites];
    nextSites[index] = result.normalized;
    await saveSites(nextSites);
  }

  async function removeSite(index) {
    const nextSites = enabledSites.filter((_site, siteIndex) => siteIndex !== index);
    await saveSites(nextSites);
  }

  function getRowIndex(button) {
    return Number(button.closest(".site-row")?.dataset.index);
  }

  async function handleSaveAction(action) {
    try {
      await action();
    } catch (error) {
      setStatus(error.message || translate("saveError"), true);
    }
  }

  function populateLanguageSelect() {
    const options = i18n.LANGUAGES.map(({ code, label }) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = label;
      return option;
    });

    languageSelect.replaceChildren(...options);
  }

  function applyLanguage(language) {
    currentLanguage = i18n.normalizeLanguage(language);
    translate = i18n.createTranslator(currentLanguage);
    document.documentElement.lang = currentLanguage.replace("_", "-");
    document.title = translate("pageTitleOptions");
    languageSelect.value = currentLanguage;
    i18n.applyTranslations(document, translate);
    renderSites();
  }

  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSaveAction(() => addSite(siteInput.value));
  });

  resetAll.addEventListener("click", () => {
    handleSaveAction(() => saveSites(DEFAULT_ENABLED_SITES));
  });

  for (const button of quickRules) {
    button.addEventListener("click", () => {
      siteInput.value = button.dataset.example;
      siteInput.focus();
    });
  }

  languageSelect.addEventListener("change", async () => {
    try {
      const savedLanguage = await i18n.setStoredLanguage(languageSelect.value);
      applyLanguage(savedLanguage);
      setStatus(translate("languageSaved"));
    } catch (error) {
      setStatus(error.message || translate("saveError"), true);
    }
  });

  siteList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
      return;
    }

    const index = getRowIndex(button);
    const rowInput = button.closest(".site-row")?.querySelector("input");

    if (!Number.isInteger(index) || !rowInput) {
      return;
    }

    if (button.dataset.action === "save") {
      handleSaveAction(() => updateSite(index, rowInput.value));
    }

    if (button.dataset.action === "delete") {
      handleSaveAction(() => removeSite(index));
    }
  });

  siteList.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter" || event.target.tagName !== "INPUT") {
      return;
    }

    event.preventDefault();
    const row = event.target.closest(".site-row");
    const index = Number(row?.dataset.index);

    if (Number.isInteger(index)) {
      handleSaveAction(() => updateSite(index, event.target.value));
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }

    if (changes[STORAGE_KEY]) {
      enabledSites = normalizeRules(changes[STORAGE_KEY].newValue);
      renderSites();
    }

    if (changes[i18n.STORAGE_KEY]) {
      applyLanguage(changes[i18n.STORAGE_KEY].newValue);
    }
  });

  document.addEventListener("DOMContentLoaded", async () => {
    populateLanguageSelect();
    applyLanguage(await i18n.getStoredLanguage());
    enabledSites = await getStoredSites();
    renderSites();
  });
})();
