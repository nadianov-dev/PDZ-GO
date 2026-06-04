module.exports = {
  root: true,
  env: { es2020: true },
  parserOptions: { ecmaVersion: 2020, sourceType: "script" },
  overrides: [
    {
      files: ["PDZ 04.06.2026.txt"],
      globals: {
        SpreadsheetApp: "readonly",
        GmailApp: "readonly",
        MailApp: "readonly",
        DriveApp: "readonly",
        LockService: "readonly",
        PropertiesService: "readonly",
        Utilities: "readonly",
        Session: "readonly",
        Logger: "readonly",
        HtmlService: "readonly",
        ScriptApp: "readonly",
        ContentService: "readonly",
        CacheService: "readonly",
        UrlFetchApp: "readonly",
        Sheets: "readonly",
        Drive: "readonly",
        MimeType: "readonly"
      },
      rules: {
        "no-unused-vars": "off",
        "no-undef": "warn"
      }
    }
  ]
};
