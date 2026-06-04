import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadGasScript } from "./gas-sandbox.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "artifacts");
const outFile = path.join(outDir, "test-invoice-email.html");

const gas = loadGasScript();

const fakeData = [
  [],
  ["12345", "Тестовый контрагент", 220000, "15.12.2025", "16.12.2025", "20.12.2025", "Тест"],
  ["67890", "Тестовый контрагент", 50324.45, "14.12.2025", "15.12.2025", "18.12.2025", ""]
];
const fakeIdx = {
  Номер: 0,
  Контрагент: 1,
  Сумма: 2,
  Дата: 3,
  "Фактическая дата счета": 4,
  "Срок оплаты": 5,
  Комментарий: 6
};

const html = gas.buildInvoiceEmailHtml_({
  rowIdxs: [1, 2],
  data: fakeData,
  idx: fakeIdx,
  osChangedByRow: new Map(),
  intro:
    "Информируем, что в адрес вашей компании выставлены следующие счета (локальный preview):"
});

const subject = gas.buildMailSubject_("Новый счёт", "Тестовый контрагент");

fs.mkdirSync(outDir, { recursive: true });
const page = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin:0;background:#eef0f3;">
  <div style="max-width:900px;margin:24px auto;padding:16px;background:#fff;border:1px solid #d7dae0;">
    <p style="font-family:Arial,sans-serif;color:#6b7280;margin:0 0 12px;">Subject: ${subject}</p>
    ${html}
  </div>
</body>
</html>`;

fs.writeFileSync(outFile, page, "utf8");
console.log("Wrote", outFile);
