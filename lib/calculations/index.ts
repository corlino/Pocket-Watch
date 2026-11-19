/**
 * Central financial calculations (PRD §8, TAD §6.1). Every total shown in the
 * app is derived here from transaction records — components never calculate.
 */
import Decimal from "decimal.js";
import { sumMoney } from "@/lib/money";
import type { IsoDate } from "@/lib/dates/date-only";

export type TxForCalc = {
  transaction_type: "income" | "expense";
  amount: string;
  transaction_date: IsoDate;
  category_id: string;
};

export type PeriodSummary = {
  income: Decimal;
  expenses: Decimal;
  netCashFlow: Decimal;
  /** null when income is zero (displayed as unavailable). May be negative. */
  savingsRate: Decimal | null;
};

export function inRange(tx: TxForCalc, start: IsoDate, end: IsoDate): boolean {
  return tx.transaction_date >= start && tx.transaction_date <= end;
}

export function summarize(transactions: TxForCalc[], start: IsoDate, end: IsoDate): PeriodSummary {
  const inPeriod = transactions.filter((t) => inRange(t, start, end));
  const income = sumMoney(inPeriod.filter((t) => t.transaction_type === "income").map((t) => t.amount));
  const expenses = sumMoney(inPeriod.filter((t) => t.transaction_type === "expense").map((t) => t.amount));
  const netCashFlow = income.minus(expenses);
  return {
    income,
    expenses,
    netCashFlow,
    savingsRate: income.isZero() ? null : netCashFlow.dividedBy(income).times(100),
  };
}

export type BudgetStatus = "normal" | "warning" | "exceeded" | "unavailable";

export type BudgetProgress = {
  allocated: Decimal;
  spent: Decimal;
  /** May be negative when overspent. */
  remaining: Decimal;
  /** null when the allocation is zero. May exceed 100. */
  utilization: Decimal | null;
  status: BudgetStatus;
};

/** PRD FR-BUD-007 thresholds: <75 normal, 75–99 warning, ≥100 exceeded. */
export function budgetStatus(utilization: Decimal | null): BudgetStatus {
  if (utilization == null) return "unavailable";
  if (utilization.gte(100)) return "exceeded";
  if (utilization.gte(75)) return "warning";
  return "normal";
}

export function budgetProgress(
  allocated: string,
  expenseAmounts: string[],
): BudgetProgress {
  const alloc = new Decimal(allocated);
  const spent = sumMoney(expenseAmounts);
  const utilization = alloc.isZero() ? null : spent.dividedBy(alloc).times(100);
  return {
    allocated: alloc,
    spent,
    remaining: alloc.minus(spent),
    utilization,
    status: budgetStatus(utilization),
  };
}

/** PRD §8.1 monthly-equivalent subscription cost. */
export function monthlyEquivalent(amount: string, interval: "weekly" | "monthly"): Decimal {
  const a = new Decimal(amount);
  return interval === "weekly" ? a.times(52).dividedBy(12) : a;
}

export type MonthPoint = { month: string; income: Decimal; expenses: Decimal; net: Decimal };

/**
 * Income and expenses per calendar month for the given month keys ("2026-11"),
 * including months with no activity (PRD §8.3).
 */
export function monthlySeries(transactions: TxForCalc[], monthKeys: string[]): MonthPoint[] {
  const buckets = new Map(monthKeys.map((m) => [m, { income: new Decimal(0), expenses: new Decimal(0) }]));
  for (const t of transactions) {
    const b = buckets.get(t.transaction_date.slice(0, 7));
    if (!b) continue;
    if (t.transaction_type === "income") b.income = b.income.plus(t.amount);
    else b.expenses = b.expenses.plus(t.amount);
  }
  return monthKeys.map((month) => {
    const b = buckets.get(month)!;
    return { month, income: b.income, expenses: b.expenses, net: b.income.minus(b.expenses) };
  });
}

/** Total expense amount per category within [start, end]. Income never counts (PRD §8.2). */
export function expensesByCategory(transactions: TxForCalc[], start: IsoDate, end: IsoDate): Map<string, Decimal> {
  const out = new Map<string, Decimal>();
  for (const t of transactions) {
    if (t.transaction_type !== "expense" || !inRange(t, start, end)) continue;
    out.set(t.category_id, (out.get(t.category_id) ?? new Decimal(0)).plus(t.amount));
  }
  return out;
}
