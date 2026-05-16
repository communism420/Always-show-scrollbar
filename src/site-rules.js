(() => {
  "use strict";

  const ALL_SITES_RULE = "*";
  const FILE_RULE = "file://";

  function normalizeRule(value) {
    const rawValue = String(value ?? "").trim().toLowerCase();

    if (!rawValue) {
      return "";
    }

    if (rawValue === ALL_SITES_RULE || rawValue === "<all_urls>") {
      return ALL_SITES_RULE;
    }

    if (rawValue === "file" || rawValue === FILE_RULE) {
      return FILE_RULE;
    }

    let host = rawValue;

    try {
      const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawValue);
      const url = new URL(hasScheme ? rawValue : `https://${rawValue}`);

      if (url.protocol === "file:") {
        return FILE_RULE;
      }

      host = url.hostname;
    } catch {
      host = rawValue
        .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
        .split(/[/?#]/)[0]
        .replace(/:\d+$/, "");
    }

    if (host.startsWith("*.")) {
      const wildcardHost = host.slice(2).replace(/^\.+|\.+$/g, "");
      return wildcardHost ? `*.${wildcardHost}` : "";
    }

    return host.replace(/^\.+|\.+$/g, "");
  }

  function normalizeRules(rules) {
    const source = Array.isArray(rules) ? rules : [];
    const normalized = source.map(normalizeRule).filter(Boolean);

    return [...new Set(normalized)];
  }

  function matchesHostRule(rule, host, protocol) {
    if (rule === ALL_SITES_RULE) {
      return true;
    }

    if (rule === FILE_RULE) {
      return protocol === "file:";
    }

    if (!host) {
      return false;
    }

    if (rule.startsWith("*.")) {
      const baseHost = rule.slice(2);
      return host === baseHost || host.endsWith(`.${baseHost}`);
    }

    return host === rule || host.endsWith(`.${rule}`);
  }

  function matchesLocation(rules, locationLike = globalThis.location) {
    const normalizedRules = normalizeRules(rules);
    const host = String(locationLike.hostname ?? "").toLowerCase().replace(/^\.+|\.+$/g, "");
    const protocol = String(locationLike.protocol ?? "").toLowerCase();

    return normalizedRules.some((rule) => matchesHostRule(rule, host, protocol));
  }

  globalThis.AlwaysShowScrollbarRules = {
    ALL_SITES_RULE,
    FILE_RULE,
    normalizeRule,
    normalizeRules,
    matchesLocation
  };
})();
