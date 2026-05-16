import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

assert(manifest.manifest_version === 3, "manifest_version must be 3.");
assert(manifest.version === "1.0.0", "manifest version must remain 1.0.0.");
assert(manifest.default_locale === "en", "default_locale must be en when __MSG_*__ is used.");
assert(manifest.name === "__MSG_extName__", "manifest name should use localized extName.");
assert(manifest.description === "__MSG_extDescription__", "manifest description should use localized extDescription.");
assert(Array.isArray(manifest.permissions), "manifest permissions must be an array.");
assert(manifest.permissions.includes("storage"), "storage permission is required for settings.");
assert(manifest.permissions.includes("scripting"), "scripting permission is required for user-origin CSS.");
assert(manifest.host_permissions?.includes("<all_urls>"), "host_permissions must include <all_urls>.");

const manifestPaths = [
  manifest.background?.service_worker,
  manifest.options_page,
  manifest.action?.default_popup,
  ...Object.values(manifest.icons || {}),
  ...Object.values(manifest.action?.default_icon || {}),
  ...(manifest.content_scripts || []).flatMap((script) => script.js || []),
  "LICENSE",
  "logo.png"
].filter(Boolean);

for (const relativePath of new Set(manifestPaths)) {
  assert(exists(relativePath), `Missing manifest referenced file: ${relativePath}`);
}

const localeDirectories = ["en", "es", "de", "pt_BR", "ru", "uk", "fr"];

for (const locale of localeDirectories) {
  const localeFile = `_locales/${locale}/messages.json`;
  assert(exists(localeFile), `Missing locale file: ${localeFile}`);

  if (exists(localeFile)) {
    const messages = JSON.parse(read(localeFile));
    assert(Boolean(messages.extName?.message), `${localeFile} missing extName.message.`);
    assert(Boolean(messages.extDescription?.message), `${localeFile} missing extDescription.message.`);
    assert(messages.extDescription.message.length <= 132, `${localeFile} description is longer than 132 characters.`);
  }
}

const sourceFiles = [
  "src/background.js",
  "src/content.js",
  "src/i18n.js",
  "src/site-rules.js",
  "options/options.js",
  "popup/popup.js",
  "options/options.html",
  "popup/popup.html"
];

const forbiddenPatterns = [
  /<script[^>]+src=["']https?:\/\//i,
  /\beval\s*\(/,
  /\bnew\s+Function\s*\(/,
  /importScripts\s*\(\s*["']https?:\/\//i
];

for (const sourceFile of sourceFiles) {
  assert(exists(sourceFile), `Missing source file: ${sourceFile}`);

  if (!exists(sourceFile)) {
    continue;
  }

  const source = read(sourceFile);

  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(source), `${sourceFile} matches forbidden pattern ${pattern}.`);
  }
}

for (const asset of [
  "store-assets/store-icon-128.png",
  "store-assets/small-promo-440x280.png",
  "store-assets/screenshot-options-1280x800.png"
]) {
  assert(exists(asset), `Missing store asset: ${asset}`);
}

if (exists("LICENSE")) {
  const license = read("LICENSE");
  assert(license.includes("MIT License"), "LICENSE must identify the MIT License.");
  assert(
    license.includes("Always show scrollbar contributors"),
    "LICENSE must include the project copyright holder."
  );
} else {
  assert(false, "Missing LICENSE file.");
}

if (errors.length > 0) {
  console.error("Extension validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Extension validation passed.");
