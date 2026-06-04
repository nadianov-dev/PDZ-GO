# AGENTS.md

## Project overview

**Ventra GO • Контроль ПДЗ** — a Google Apps Script bound to Google Spreadsheets. The canonical source in git is `PDZ 04.06.2026.txt` (~4.3k lines). Runtime is Google Workspace (Spreadsheets, Gmail, Drive, Sheets API advanced service), not a local web server.

## Local development (Node)

| Command | Purpose |
|---------|---------|
| `npm install` | Install ESLint, clasp, types |
| `npm run lint` | ESLint on `PDZ 04.06.2026.txt` |
| `npm test` | Smoke tests via mocked GAS runtime + writes `artifacts/test-invoice-email.html` |
| `npm run preview:email` | Regenerate HTML invoice preview only |
| `node dev/verify-source.mjs` | Copy source into `gas/Code.gs` for clasp |

There is no compile step. “Build” = sync to Apps Script (`clasp push`) after auth.

## Deploying to Google Apps Script

1. Open the bound spreadsheet → **Extensions → Apps Script**.
2. Paste `PDZ 04.06.2026.txt` into `Code.gs` (or use clasp after login).
3. Enable advanced service **Google Sheets API** (`Sheets`).
4. Approve OAuth scopes on first run.
5. Reload the spreadsheet → menu **GO • Контроль ПДЗ**.

Optional clasp workflow: set `scriptId` in `.clasp.json`, run `npx clasp login`, then `node dev/verify-source.mjs && npx clasp push`.

## Spreadsheet dependencies (production)

Hardcoded IDs in source: `PDZ_MAIN_SPREADSHEET_ID`, `PDZ_IMPORT_SPREADSHEET_ID`. Required sheets for full pipeline include **Реестр**, **Договора**, **Почта КА**; import sheet **Выгрузка** on the import spreadsheet.

## Cursor Cloud specific instructions

- **No local app server.** Do not expect `npm run dev` or Docker Compose; verify changes with `npm run lint` and `npm test`.
- **Update script** runs `npm install` only; it does not start Google services or run clasp push.
- **Full E2E** (Gmail import, `runMainPipeline`, real `testSendInvoiceEmail`) requires a Google account with access to the production spreadsheets and mailbox. Use Apps Script IDE or spreadsheet menu after `clasp push`.
- **Local “hello world”** for invoice emails: `npm test` → open `artifacts/test-invoice-email.html` in a browser (same HTML builder as `testSendInvoiceEmail()` without sending mail).
- **`gas/Code.gs`** is generated locally and gitignored; always edit `PDZ 04.06.2026.txt` in git, then run `node dev/verify-source.mjs` before clasp.
- **Time zone** for date logic defaults to `Europe/Samara` (see `appsscript.json` and `getSpreadsheetTimeZone_()`).
