import { describe, expect, it } from "vitest";
import Decimal from "decimal.js";
import { formatMoney, formatPercent, formatTransactionAmount, parseAmountInput, sumMoney } from "@/lib/money";
import { budgetProgress, budgetStatus, monthlyEquivalent, summarize, type TxForCalc } from "@/lib/calculations";
import { toIsoDate } from "@/lib/dates/date-only";

describe("amount input validation (FR-TRANS-003)", () => {
  it.each([
    ["12", "12.00"],
    ["12.5", "12.50"],
    ["12.34", "12.34"],
    [".5", "0.50"],
    ["1,234.56", "1234.56"],
    ["$9.99", "9.99"],
  ])("accepts %s", (input, expected) => {
    expect(parseAmountInput(input)).toEqual({ ok: true, value: expected });
  });

  it.each(["", "abc", "12.345", "-5", "1e5", "12..3", "0x10", " 1 2 "])("rejects %j", (input) => {
    expect(parseAmountInput(input).ok).toBe(false);
  });

  it("rejects zero for transactions but allows it for budgets", () => {
    expect(parseAmountInput("0").ok).toBe(false);
    expect(parseAmountInput("0", { allowZero: true })).toEqual({ ok: true, value: "0.00" });
  });

  it("rejects values beyond NUMERIC(12,2)", () => {
    expect(parseAmountInput("10000000000").ok).toBe(false);
  });
});

describe("precision", () => {
  it("does not suffer floating-point error", () => {
    expect(sumMoney(["0.10", "0.20"]).toFixed(2)).toBe("0.30");
    expect(sumMoney(Array(10).fill("0.10")).toFixed(2)).toBe("1.00");
  });
});

describe("formatting", () => {
  it("formats CAD by default", () => {
    expect(formatMoney("11291.84")).toBe("$11,291.84");
    expect(formatMoney("-348.52")).toBe("-$348.52");
    expect(formatMoney("0")).toBe("$0.00");
  });
  it("formats signed transaction amounts", () => {
    expect(formatTransactionAmount("2624.84", "income")).toBe("+$2,624.84");
    expect(formatTransactionAmount("348.52", "expense")).toBe("-$348.52");
  });
  it("changes only the display for other currencies and number formats", () => {
    expect(formatMoney("1234.5", { currency: "EUR", numberFormat: "dot-comma" })).toBe("€1.234,50");
    expect(formatMoney("1234.5", { currency: "GBP" })).toBe("£1,234.50");
  });
  it("formats percentages and unavailable values", () => {
    expect(formatPercent(new Decimal("49.2537"))).toBe("49.25%");
    expect(formatPercent(null)).toBe("—");
  });
});

const tx = (type: "income" | "expense", amount: string, date: string, category = "c1"): TxForCalc => ({
  transaction_type: type,
  amount,
  transaction_date: toIsoDate(date),
  category_id: category,
});

describe("period summary (PRD §8.1)", () => {
  const start = toIsoDate("2026-11-01");
  const end = toIsoDate("2026-11-30");

  it("computes income, expenses, net and savings rate", () => {
    const s = summarize(
      [tx("income", "4953.92", "2026-11-01"), tx("expense", "2514.22", "2026-11-15")],
      start,
      end,
    );
    expect(s.income.toFixed(2)).toBe("4953.92");
    expect(s.expenses.toFixed(2)).toBe("2514.22");
    expect(s.netCashFlow.toFixed(2)).toBe("2439.70");
    expect(s.savingsRate?.toFixed(2)).toBe("49.25");
  });

  it("reports savings rate as unavailable with zero income", () => {
    expect(summarize([tx("expense", "10", "2026-11-02")], start, end).savingsRate).toBeNull();
  });

  it("allows negative net cash flow and savings rate", () => {
    const s = summarize([tx("income", "100", "2026-11-02"), tx("expense", "150", "2026-11-03")], start, end);
    expect(s.netCashFlow.toFixed(2)).toBe("-50.00");
    expect(s.savingsRate?.toFixed(2)).toBe("-50.00");
  });

  it("respects month boundaries", () => {
    const s = summarize(
      [tx("expense", "1", "2026-10-31"), tx("expense", "2", "2026-11-01"), tx("expense", "4", "2026-11-30"), tx("expense", "8", "2026-12-01")],
      start,
      end,
    );
    expect(s.expenses.toFixed(2)).toBe("6.00");
  });
});

describe("budgets (PRD FR-BUD-007, §8.1)", () => {
  it("applies the 75/100 thresholds", () => {
    expect(budgetStatus(new Decimal("74.99"))).toBe("normal");
    expect(budgetStatus(new Decimal("75"))).toBe("warning");
    expect(budgetStatus(new Decimal("99.99"))).toBe("warning");
    expect(budgetStatus(new Decimal("100"))).toBe("exceeded");
  });
  it("shows negative remaining and >100% utilisation when overspent", () => {
    const p = budgetProgress("500", ["400", "250"]);
    expect(p.remaining.toFixed(2)).toBe("-150.00");
    expect(p.utilization?.toFixed(0)).toBe("130");
    expect(p.status).toBe("exceeded");
  });
  it("treats a zero budget as unavailable utilisation", () => {
    const p = budgetProgress("0", ["20"]);
    expect(p.utilization).toBeNull();
    expect(p.status).toBe("unavailable");
    expect(p.remaining.toFixed(2)).toBe("-20.00");
  });
});

describe("subscription monthly equivalent", () => {
  it("converts weekly amounts as ×52/12", () => {
    expect(monthlyEquivalent("12.00", "weekly").toFixed(2)).toBe("52.00");
    expect(monthlyEquivalent("9.99", "monthly").toFixed(2)).toBe("9.99");
  });
});
