(() => {
  "use strict";

  const i18n = globalThis.AlwaysShowScrollbarI18n;

  async function initialize() {
    const language = await i18n.getStoredLanguage();
    const translate = i18n.createTranslator(language);

    document.documentElement.lang = language.replace("_", "-");
    document.title = translate("pageTitlePopup");
    i18n.applyTranslations(document, translate);
  }

  document.getElementById("editDomains").addEventListener("click", () => {
    chrome.runtime.openOptionsPage(() => {
      window.close();
    });
  });

  initialize();
})();
