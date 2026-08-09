---
name: i18n-sync
description: 'Sync translations from src/assets/i18n/zh-CN.json into the other locale JSON files under src/assets/i18n. Use when new Chinese i18n keys were added and the matching keys need to be added and translated in en-US.json, zh-TW.json, ja-JP.json, ko-KR.json, and other locale files. Preserve existing translations unless the user explicitly asks to overwrite them.'
argument-hint: 'Describe the new zh-CN keys or ask to sync current changes'
user-invocable: true
---

# I18n Sync

Sync newly added translation keys from `src/assets/i18n/zh-CN.json` to the other locale files in `src/assets/i18n/`.

## When To Use

- The user added new records to `src/assets/i18n/zh-CN.json`
- Other locale files are missing the same keys
- The user wants AI to translate and append the missing entries
- The user wants to keep existing translations untouched

## Default Rules

- Treat `src/assets/i18n/zh-CN.json` as the source of truth for key structure
- Only add missing keys unless the user explicitly asks to refresh existing translations
- Preserve JSON structure, indentation, and surrounding ordering as much as possible
- Keep placeholders such as `{{value}}`, `{{month}}`, and `{{day}}` unchanged
- Keep product names, poem titles, and proper nouns unchanged unless translation is clearly requested
- If a Chinese string is ambiguous, state the assumption briefly before translating

## Procedure

1. Read `src/assets/i18n/zh-CN.json` and identify the newly added keys.
2. List all target locale files in `src/assets/i18n/` except `zh-CN.json`.
3. For each target locale file, compare key paths against the source.
4. Add only the missing keys at the matching nested location.
5. Translate the Chinese value into the target language.
6. Preserve interpolation tokens, punctuation intent, and JSON validity.
7. After editing, run a focused validation to make sure the JSON files are still parseable.
8. After editing, run ionic build to ensure the i18n JSON changes do not break the frontend build.
9. Report which locale files were updated and note any strings that may need human review.

## Translation Guidance

- `en-US`: concise app UI wording, natural mobile wording
- `zh-TW`: Traditional Chinese, avoid Simplified characters
- `ja-JP`: short UI labels, avoid over-literal machine phrasing
- `ko-KR`: concise UI language, preserve honorific neutrality
- `fr-FR`, `de-DE`, `es-ES`, `pt-PT`, `ru-RU`, `el-GR`, `ar-AE`, `th-TH`: prefer natural product UI translations over word-for-word translations

## Good Invocation Examples

- `/i18n-sync sync new keys from zh-CN.json to all locales`
- `/i18n-sync I added SolarTerm and Action entries in zh-CN.json, update the other locale files`
- `/i18n-sync compare current zh-CN.json with all other i18n files and fill missing translations only`

## Notes

- If the user names a subset of locales, update only those files.
- If the user asks to overwrite old translations, confirm that overwrite is intended and then update existing values.
- If a locale file is missing entirely, create it only if the user explicitly asks.