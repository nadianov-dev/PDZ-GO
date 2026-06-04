import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadGasScript } from "./gas-sandbox.mjs";

describe("PDZ GO — local smoke (Google Apps Script logic)", () => {
  const gas = loadGasScript();

  it("maps invoice stages to email buckets", () => {
    assert.equal(gas.mapStageToBucketByStage("Ожидает оплаты"), "Новый счёт");
    assert.equal(gas.mapStageToBucketByStage("До оплаты 2 дня"), "1–3 дня до оплаты");
    assert.equal(gas.mapStageToBucketByStage("Просрочка 1"), "Просрочка 1 день");
    assert.equal(gas.mapStageToBucketByStage(null), null);
  });

  it("decides send windows by bucket and daysDiff", () => {
    assert.equal(gas.shouldSendToday("Новый счёт", -5), true);
    assert.equal(gas.shouldSendToday("Просрочка 1 день", 1), true);
    assert.equal(gas.shouldSendToday("Просрочка 1 день", 2), false);
  });

  it("detects CSV delimiter from sample text", () => {
    assert.equal(gas.detectDelimiter("a;b;c\n1;2;3"), ";");
    assert.equal(gas.detectDelimiter("a,b,c\n1,2,3"), ",");
  });

  it("normalizes counterparty names", () => {
    assert.equal(gas.normalizeKA_('  «Тест»  '), "ТЕСТ");
  });

  it("formats money for Russian locale in emails", () => {
    const s = gas.fmtMoneyRu_(220000);
    assert.match(s, /220/);
  });

  it("builds client email subject lines", () => {
    const subj = gas.buildMailSubject_("Новый счёт", "ООО Ромашка");
    assert.match(subj, /Ventra GO/);
    assert.match(subj, /Ромашка/);
  });

  it("computes PDZ 31+ metrics from sample rows", () => {
    const rows = [
      { sum: 100000, overdue: 45, contr: "A", isJudicial: false },
      { sum: 50000, overdue: 70, contr: "B", isJudicial: true }
    ];
    const m = gas.PDZ_computeMetrics_(rows);
    assert.equal(m.count, 2);
    assert.equal(m.sum, 150000);
    assert.equal(m.aging["31–60"].cnt, 1);
    assert.equal(m.aging["60+"].cnt, 1);
  });

  it("renders invoice HTML email body (core product output)", () => {
    const fakeData = [
      [],
      ["12345", "Тестовый контрагент", 220000, "15.12.2025", "16.12.2025", "20.12.2025", "Коммент"]
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
      rowIdxs: [1],
      data: fakeData,
      idx: fakeIdx,
      osChangedByRow: new Map(),
      intro: "Информируем о выставленных счетах:"
    });

    assert.match(html, /Ventra GO|7E3ACE/i);
    assert.match(html, /12345/);
    assert.match(html, /220/);
  });
});
