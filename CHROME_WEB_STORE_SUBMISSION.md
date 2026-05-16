# Chrome Web Store Submission Notes

Use these notes when filling out the Chrome Web Store Developer Dashboard.

## Package

Upload:

```text
dist/always-show-scrollbar-1.0.0.zip
```

The ZIP contains only runtime extension files:

- `manifest.json`
- `LICENSE`
- `_locales/`
- `icons/`
- `options/`
- `popup/`
- `src/`
- `logo.png`

## Single Purpose

Always show scrollbar keeps native vertical and horizontal scrollbars visible on websites selected by the user.

## Open Source Policy

The extension is fully open source under the MIT License.

The MIT License applies to the extension source code, documentation, UI files, localization files, generated store assets, and included logo assets in this repository unless a file explicitly says otherwise.

Use the repository URL as the public source code URL in the Chrome Web Store listing after publishing the repository.

## Category

Recommended category: `Accessibility` or `Productivity`.

`Accessibility` is a reasonable fit because the extension improves page navigation visibility.

## Store Listing - English

Short description:

```text
Keep native vertical and horizontal scrollbars visible on selected websites.
```

Detailed description:

```text
Always show scrollbar keeps browser scrollbars visible on websites where they are hidden or styled away.

Use the domain filter to enable the extension everywhere or only on selected sites. The extension supports page scrollbars and existing scroll containers while avoiding unnecessary scrollbars on regular clipped content.

Features:
- Works with Manifest V3.
- Supports vertical and horizontal scrollbars.
- Domain filter with wildcard, all-sites, and local-file rules.
- Options page and popup shortcut.
- Interface languages: English, Spanish, German, Portuguese (Brazil), Russian, Ukrainian, and French.
- No analytics, no ads, no tracking, and no remote code.
- Fully open source under the MIT License.

Some browser-controlled pages such as chrome:// pages cannot be modified by extensions because Chromium blocks content scripts there.
```

## Privacy Practices

Suggested answers:

- Remote code: `No, I am not using remote code.`
- Data collection: the extension does not collect user data for the developer or third parties.
- Data stored locally/synced by Chrome: domain filter rules and selected interface language.
- Privacy policy URL: enable GitHub Pages from the `docs/` folder and use the public `privacy-policy.html` URL.
- Source code URL: use the public GitHub repository URL.

## Permission Justifications

`storage`

```text
Used to save the user's enabled domain rules and selected interface language with chrome.storage.sync.
```

`scripting`

```text
Used to insert extension-owned CSS into enabled webpages so native scrollbars remain visible even when page styles hide them. The extension does not execute remote code.
```

`host_permissions: <all_urls>`

```text
Required because users can enable scrollbar fixes on any website or all websites. The extension applies CSS only according to the user's domain filter and does not transmit page content or browsing data.
```

## Test Instructions For Reviewers

No account, login, payment, or external service is required.

1. Install the extension.
2. Click the toolbar icon and select `Edit domains`.
3. Confirm the default rule is `*`, which enables the extension on all supported sites.
4. Open a normal webpage with vertical scrolling and verify the page scrollbar remains visible.
5. In the options page, remove `*`, add a specific domain such as `example.com`, and verify the extension only applies on matching domains.
6. Change the interface language from the language selector and confirm the popup/options UI updates.

## Store Assets

Generated assets are in `store-assets/`:

- `store-icon-128.png`
- `small-promo-440x280.png`
- `marquee-promo-1400x560.png`
- `screenshot-options-1280x800.png`
- `screenshot-popup-1280x800.png`

Chrome Web Store requires at least the 128x128 icon, one 440x280 small promotional image, and at least one screenshot.
