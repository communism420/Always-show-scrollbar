(() => {
  "use strict";

  const STORAGE_KEY = "uiLanguage";
  const DEFAULT_LANGUAGE = "en";
  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "de", label: "Deutsch" },
    { code: "pt_BR", label: "Português (Brasil)" },
    { code: "ru", label: "Русский" },
    { code: "uk", label: "Українська" },
    { code: "fr", label: "Français" }
  ];

  const TRANSLATIONS = {
    en: {
      pageTitleOptions: "Always show scrollbar Options",
      pageTitlePopup: "Always show scrollbar",
      brandName: "Always show scrollbar",
      domainFilter: "Domain filter",
      lede: "Choose where persistent page scrollbars should be enabled.",
      activeRules: "Active rules",
      languageLabel: "Interface language",
      addTitle: "Add a domain rule",
      addHelp: "Enter a domain, wildcard, or special rule.",
      domainInputLabel: "Domain or wildcard",
      domainInputPlaceholder: "example.com, *.example.com, file://, or *",
      addRule: "Add rule",
      quickRulesLabel: "Quick rules",
      allSites: "All sites",
      localFiles: "Local files",
      wildcard: "Wildcard",
      enabledSites: "Enabled sites",
      enabledSitesHelp: "Rules are matched against the current page before the content script applies scrollbar fixes.",
      enableAllSites: "Enable all sites",
      emptyState: "No enabled domains yet. Add one above or enable all sites.",
      enabledSiteRulesLabel: "Enabled site rules",
      saved: "Saved",
      languageSaved: "Language saved",
      invalidRule: "Enter a domain or *.",
      duplicateRule: "This site is already listed.",
      saveError: "Could not save settings.",
      ruleAllDescription: "Applies on every supported website.",
      ruleLocalDescription: "Applies on local file pages when Chrome allows file access.",
      ruleWildcardDescription: "Applies on this domain and all matching subdomains.",
      ruleDomain: "Domain",
      ruleDomainDescription: "Applies on this domain and its subdomains.",
      siteRuleLabel: "Site rule",
      update: "Update",
      remove: "Remove",
      popupSubtitle: "Domain filtering",
      editDomains: "Edit domains"
    },
    es: {
      pageTitleOptions: "Opciones de Always show scrollbar",
      pageTitlePopup: "Always show scrollbar",
      brandName: "Always show scrollbar",
      domainFilter: "Filtro de dominios",
      lede: "Elige dónde deben activarse las barras de desplazamiento persistentes.",
      activeRules: "Reglas activas",
      languageLabel: "Idioma de la interfaz",
      addTitle: "Añadir una regla de dominio",
      addHelp: "Introduce un dominio, un comodín o una regla especial.",
      domainInputLabel: "Dominio o comodín",
      domainInputPlaceholder: "example.com, *.example.com, file:// o *",
      addRule: "Añadir regla",
      quickRulesLabel: "Reglas rápidas",
      allSites: "Todos los sitios",
      localFiles: "Archivos locales",
      wildcard: "Comodín",
      enabledSites: "Sitios habilitados",
      enabledSitesHelp: "Las reglas se comparan con la página actual antes de aplicar los ajustes de scrollbar.",
      enableAllSites: "Habilitar todos los sitios",
      emptyState: "Aún no hay dominios habilitados. Añade uno arriba o habilita todos los sitios.",
      enabledSiteRulesLabel: "Reglas de sitios habilitados",
      saved: "Guardado",
      languageSaved: "Idioma guardado",
      invalidRule: "Introduce un dominio o *.",
      duplicateRule: "Este sitio ya está en la lista.",
      saveError: "No se pudo guardar la configuración.",
      ruleAllDescription: "Se aplica en todos los sitios web compatibles.",
      ruleLocalDescription: "Se aplica en páginas de archivos locales cuando Chrome permite el acceso.",
      ruleWildcardDescription: "Se aplica a este dominio y a todos los subdominios coincidentes.",
      ruleDomain: "Dominio",
      ruleDomainDescription: "Se aplica a este dominio y sus subdominios.",
      siteRuleLabel: "Regla de sitio",
      update: "Actualizar",
      remove: "Eliminar",
      popupSubtitle: "Filtro de dominios",
      editDomains: "Editar dominios"
    },
    de: {
      pageTitleOptions: "Optionen für Always show scrollbar",
      pageTitlePopup: "Always show scrollbar",
      brandName: "Always show scrollbar",
      domainFilter: "Domainfilter",
      lede: "Wähle aus, wo dauerhafte Scrollleisten aktiviert werden sollen.",
      activeRules: "Aktive Regeln",
      languageLabel: "Sprache der Oberfläche",
      addTitle: "Domainregel hinzufügen",
      addHelp: "Gib eine Domain, einen Platzhalter oder eine Sonderregel ein.",
      domainInputLabel: "Domain oder Platzhalter",
      domainInputPlaceholder: "example.com, *.example.com, file:// oder *",
      addRule: "Regel hinzufügen",
      quickRulesLabel: "Schnellregeln",
      allSites: "Alle Websites",
      localFiles: "Lokale Dateien",
      wildcard: "Platzhalter",
      enabledSites: "Aktivierte Websites",
      enabledSitesHelp: "Regeln werden mit der aktuellen Seite abgeglichen, bevor das Content Script Scrollleisten korrigiert.",
      enableAllSites: "Alle Websites aktivieren",
      emptyState: "Noch keine Domains aktiviert. Füge oben eine hinzu oder aktiviere alle Websites.",
      enabledSiteRulesLabel: "Regeln für aktivierte Websites",
      saved: "Gespeichert",
      languageSaved: "Sprache gespeichert",
      invalidRule: "Gib eine Domain oder * ein.",
      duplicateRule: "Diese Website ist bereits eingetragen.",
      saveError: "Einstellungen konnten nicht gespeichert werden.",
      ruleAllDescription: "Gilt für jede unterstützte Website.",
      ruleLocalDescription: "Gilt für lokale Dateiseiten, wenn Chrome den Zugriff erlaubt.",
      ruleWildcardDescription: "Gilt für diese Domain und alle passenden Subdomains.",
      ruleDomain: "Domain",
      ruleDomainDescription: "Gilt für diese Domain und ihre Subdomains.",
      siteRuleLabel: "Website-Regel",
      update: "Aktualisieren",
      remove: "Entfernen",
      popupSubtitle: "Domainfilter",
      editDomains: "Domains bearbeiten"
    },
    pt_BR: {
      pageTitleOptions: "Opções do Always show scrollbar",
      pageTitlePopup: "Always show scrollbar",
      brandName: "Always show scrollbar",
      domainFilter: "Filtro de domínios",
      lede: "Escolha onde as barras de rolagem persistentes devem ser ativadas.",
      activeRules: "Regras ativas",
      languageLabel: "Idioma da interface",
      addTitle: "Adicionar uma regra de domínio",
      addHelp: "Digite um domínio, curinga ou regra especial.",
      domainInputLabel: "Domínio ou curinga",
      domainInputPlaceholder: "example.com, *.example.com, file:// ou *",
      addRule: "Adicionar regra",
      quickRulesLabel: "Regras rápidas",
      allSites: "Todos os sites",
      localFiles: "Arquivos locais",
      wildcard: "Curinga",
      enabledSites: "Sites ativados",
      enabledSitesHelp: "As regras são comparadas com a página atual antes de o content script aplicar correções de scrollbar.",
      enableAllSites: "Ativar todos os sites",
      emptyState: "Ainda não há domínios ativados. Adicione um acima ou ative todos os sites.",
      enabledSiteRulesLabel: "Regras de sites ativados",
      saved: "Salvo",
      languageSaved: "Idioma salvo",
      invalidRule: "Digite um domínio ou *.",
      duplicateRule: "Este site já está na lista.",
      saveError: "Não foi possível salvar as configurações.",
      ruleAllDescription: "Aplica-se a todos os sites compatíveis.",
      ruleLocalDescription: "Aplica-se a páginas de arquivos locais quando o Chrome permite acesso.",
      ruleWildcardDescription: "Aplica-se a este domínio e a todos os subdomínios correspondentes.",
      ruleDomain: "Domínio",
      ruleDomainDescription: "Aplica-se a este domínio e seus subdomínios.",
      siteRuleLabel: "Regra do site",
      update: "Atualizar",
      remove: "Remover",
      popupSubtitle: "Filtro de domínios",
      editDomains: "Editar domínios"
    },
    ru: {
      pageTitleOptions: "Настройки Always show scrollbar",
      pageTitlePopup: "Always show scrollbar",
      brandName: "Always show scrollbar",
      domainFilter: "Фильтр доменов",
      lede: "Выберите, где должны быть включены постоянные полосы прокрутки страницы.",
      activeRules: "Активные правила",
      languageLabel: "Язык интерфейса",
      addTitle: "Добавить правило домена",
      addHelp: "Введите домен, wildcard или специальное правило.",
      domainInputLabel: "Домен или wildcard",
      domainInputPlaceholder: "example.com, *.example.com, file:// или *",
      addRule: "Добавить правило",
      quickRulesLabel: "Быстрые правила",
      allSites: "Все сайты",
      localFiles: "Локальные файлы",
      wildcard: "Wildcard",
      enabledSites: "Включенные сайты",
      enabledSitesHelp: "Правила сверяются с текущей страницей до применения исправлений scrollbar.",
      enableAllSites: "Включить все сайты",
      emptyState: "Пока нет включенных доменов. Добавьте домен выше или включите все сайты.",
      enabledSiteRulesLabel: "Правила включенных сайтов",
      saved: "Сохранено",
      languageSaved: "Язык сохранен",
      invalidRule: "Введите домен или *.",
      duplicateRule: "Этот сайт уже есть в списке.",
      saveError: "Не удалось сохранить настройки.",
      ruleAllDescription: "Применяется на всех поддерживаемых сайтах.",
      ruleLocalDescription: "Применяется на локальных файлах, если Chrome разрешает доступ.",
      ruleWildcardDescription: "Применяется к этому домену и всем подходящим поддоменам.",
      ruleDomain: "Домен",
      ruleDomainDescription: "Применяется к этому домену и его поддоменам.",
      siteRuleLabel: "Правило сайта",
      update: "Обновить",
      remove: "Удалить",
      popupSubtitle: "Фильтр доменов",
      editDomains: "Редактировать домены"
    },
    uk: {
      pageTitleOptions: "Налаштування Always show scrollbar",
      pageTitlePopup: "Always show scrollbar",
      brandName: "Always show scrollbar",
      domainFilter: "Фільтр доменів",
      lede: "Виберіть, де мають бути ввімкнені постійні смуги прокручування сторінки.",
      activeRules: "Активні правила",
      languageLabel: "Мова інтерфейсу",
      addTitle: "Додати правило домену",
      addHelp: "Введіть домен, wildcard або спеціальне правило.",
      domainInputLabel: "Домен або wildcard",
      domainInputPlaceholder: "example.com, *.example.com, file:// або *",
      addRule: "Додати правило",
      quickRulesLabel: "Швидкі правила",
      allSites: "Усі сайти",
      localFiles: "Локальні файли",
      wildcard: "Wildcard",
      enabledSites: "Увімкнені сайти",
      enabledSitesHelp: "Правила звіряються з поточною сторінкою до застосування виправлень scrollbar.",
      enableAllSites: "Увімкнути всі сайти",
      emptyState: "Поки немає увімкнених доменів. Додайте домен вище або увімкніть усі сайти.",
      enabledSiteRulesLabel: "Правила увімкнених сайтів",
      saved: "Збережено",
      languageSaved: "Мову збережено",
      invalidRule: "Введіть домен або *.",
      duplicateRule: "Цей сайт уже є у списку.",
      saveError: "Не вдалося зберегти налаштування.",
      ruleAllDescription: "Застосовується на всіх підтримуваних сайтах.",
      ruleLocalDescription: "Застосовується на локальних файлах, якщо Chrome дозволяє доступ.",
      ruleWildcardDescription: "Застосовується до цього домену та всіх відповідних піддоменів.",
      ruleDomain: "Домен",
      ruleDomainDescription: "Застосовується до цього домену та його піддоменів.",
      siteRuleLabel: "Правило сайту",
      update: "Оновити",
      remove: "Видалити",
      popupSubtitle: "Фільтр доменів",
      editDomains: "Редагувати домени"
    },
    fr: {
      pageTitleOptions: "Options de Always show scrollbar",
      pageTitlePopup: "Always show scrollbar",
      brandName: "Always show scrollbar",
      domainFilter: "Filtre de domaines",
      lede: "Choisissez où les barres de défilement persistantes doivent être activées.",
      activeRules: "Règles actives",
      languageLabel: "Langue de l'interface",
      addTitle: "Ajouter une règle de domaine",
      addHelp: "Saisissez un domaine, un joker ou une règle spéciale.",
      domainInputLabel: "Domaine ou joker",
      domainInputPlaceholder: "example.com, *.example.com, file:// ou *",
      addRule: "Ajouter une règle",
      quickRulesLabel: "Règles rapides",
      allSites: "Tous les sites",
      localFiles: "Fichiers locaux",
      wildcard: "Joker",
      enabledSites: "Sites activés",
      enabledSitesHelp: "Les règles sont comparées à la page actuelle avant l'application des corrections de scrollbar.",
      enableAllSites: "Activer tous les sites",
      emptyState: "Aucun domaine activé pour le moment. Ajoutez-en un ci-dessus ou activez tous les sites.",
      enabledSiteRulesLabel: "Règles des sites activés",
      saved: "Enregistré",
      languageSaved: "Langue enregistrée",
      invalidRule: "Saisissez un domaine ou *.",
      duplicateRule: "Ce site est déjà dans la liste.",
      saveError: "Impossible d'enregistrer les paramètres.",
      ruleAllDescription: "S'applique à tous les sites web pris en charge.",
      ruleLocalDescription: "S'applique aux fichiers locaux lorsque Chrome autorise l'accès.",
      ruleWildcardDescription: "S'applique à ce domaine et à tous les sous-domaines correspondants.",
      ruleDomain: "Domaine",
      ruleDomainDescription: "S'applique à ce domaine et à ses sous-domaines.",
      siteRuleLabel: "Règle de site",
      update: "Mettre à jour",
      remove: "Supprimer",
      popupSubtitle: "Filtre de domaines",
      editDomains: "Modifier les domaines"
    }
  };

  function normalizeLanguage(language) {
    const normalized = String(language || "").replace("-", "_");

    if (TRANSLATIONS[normalized]) {
      return normalized;
    }

    const baseLanguage = normalized.split("_")[0];

    if (TRANSLATIONS[baseLanguage]) {
      return baseLanguage;
    }

    return DEFAULT_LANGUAGE;
  }

  function getBrowserLanguage() {
    return normalizeLanguage(chrome.i18n?.getUILanguage?.() || navigator.language);
  }

  function getStoredLanguage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [STORAGE_KEY]: getBrowserLanguage() }, (items) => {
        resolve(normalizeLanguage(items[STORAGE_KEY]));
      });
    });
  }

  function setStoredLanguage(language) {
    return new Promise((resolve, reject) => {
      const normalizedLanguage = normalizeLanguage(language);

      chrome.storage.sync.set({ [STORAGE_KEY]: normalizedLanguage }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(normalizedLanguage);
      });
    });
  }

  function createTranslator(language) {
    const normalizedLanguage = normalizeLanguage(language);
    const dictionary = TRANSLATIONS[normalizedLanguage] || TRANSLATIONS[DEFAULT_LANGUAGE];

    return (key) => {
      return dictionary[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key;
    };
  }

  function applyTranslations(root, translate) {
    for (const element of root.querySelectorAll("[data-i18n]")) {
      element.textContent = translate(element.dataset.i18n);
    }

    for (const element of root.querySelectorAll("[data-i18n-placeholder]")) {
      element.setAttribute("placeholder", translate(element.dataset.i18nPlaceholder));
    }

    for (const element of root.querySelectorAll("[data-i18n-label]")) {
      element.setAttribute("aria-label", translate(element.dataset.i18nLabel));
    }
  }

  globalThis.AlwaysShowScrollbarI18n = {
    LANGUAGES,
    STORAGE_KEY,
    DEFAULT_LANGUAGE,
    normalizeLanguage,
    getStoredLanguage,
    setStoredLanguage,
    createTranslator,
    applyTranslations
  };
})();
