import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(__dirname, "..", "PDZ 04.06.2026.txt");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDate(date, _tz, fmt) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  if (fmt === "yyyy-MM-dd") {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  if (fmt === "yyyy-MM-dd HH:mm:ss") {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }
  if (fmt === "MM-dd") {
    return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  return d.toISOString();
}

function makeSpreadsheetMock() {
  return {
    getSpreadsheetTimeZone: () => "Europe/Samara",
    getSheetByName: () => null,
    toast: () => {},
    getUi: () => ({
      createMenu: () => ({
        addItem: () => ({ addItem: () => ({ addSeparator: () => ({}) }) }),
        addSeparator: () => ({}),
        addToUi: () => {}
      })
    })
  };
}

export function loadGasScript() {
  const code = fs.readFileSync(SOURCE, "utf8");
  const sandbox = {
    console,
    Date,
    Math,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Map,
    Set,
    Error,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    RegExp,
    SpreadsheetApp: {
      openById: () => makeSpreadsheetMock(),
      getActiveSpreadsheet: () => makeSpreadsheetMock(),
      getUi: () => makeSpreadsheetMock().getUi()
    },
    Session: { getScriptTimeZone: () => "Europe/Samara" },
    Utilities: { formatDate },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => true,
        releaseLock: () => {}
      })
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: () => null,
        setProperty: () => {}
      })
    },
    GmailApp: { sendEmail: () => {} },
    MailApp: { sendEmail: () => {} },
    DriveApp: {},
    Logger: { log: () => {} },
    Sheets: {}
  };

  vm.runInNewContext(code, sandbox, { filename: SOURCE, timeout: 30_000 });
  return sandbox;
}
