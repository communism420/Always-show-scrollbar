# Always show scrollbar

Manifest V3 extension for Chromium browsers that keeps native vertical and horizontal scrollbars visible on user-selected sites.

## Features

- Runs on Chromium browsers with Manifest V3.
- Uses a domain filter stored in `chrome.storage.sync`.
- Supports English, Spanish, German, Portuguese (Brazil), Russian, Ukrainian, and French UI strings.
- Provides an options page for editing domain rules and a popup shortcut to open it.
- Does not use remote code, external scripts, analytics, or network requests.
- Fully open source under the MIT License.

## Open Source License

Always show scrollbar is released as open-source software under the MIT License.

This applies to the extension source code, documentation, UI files, localization files, generated store assets, and included logo assets in this repository unless a file explicitly says otherwise.

See `LICENSE` for the full license text.

## Chrome Web Store package

The uploadable package is generated at:

```text
dist/always-show-scrollbar-1.0.0.zip
```

To rebuild it:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/package-extension.ps1
```

To validate without packaging:

```powershell
node scripts/validate-extension.mjs
```

## Included store materials

- `CHROME_WEB_STORE_SUBMISSION.md` contains listing copy, privacy answers, permission justifications, and reviewer test instructions.
- `PRIVACY_POLICY.md` contains a privacy policy draft. Host it at a public URL and provide that URL in the Chrome Web Store Developer Dashboard.
- `docs/` contains a GitHub Pages-ready `index.html` and `privacy-policy.html`.
- `store-assets/` contains generated listing graphics.
- `LICENSE` contains the MIT License for the full open-source release.
