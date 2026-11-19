import "server-only";
import Decimal from "decimal.js";
import { requireUser } from "@/lib/auth/dal";
import { budgetProgress, type BudgetProgress, type TxForCalc } from "@/lib/calculations";
import { monthRange, yearRange, type IsoDate, type MonthKey } from "@/lib/dates/date-only";
import { sumMoney } from "@/lib/money";
import type { Category } from "@/features/transactions/types";

export type AnalyticsTx = TxForCalc & { is_subscription: boolean };

/**
 * All transactions in a range with the flag analytics needs (whether each
 * came from a subscription schedule). One read feeds every section.
 */
export async function analyticsTransactions(start: IsoDate, end: IsoDate): Promise<AnalyticsTx[]> {
  const { supabase } = await requireUser();
  const PAGE = 1000;
  const rows: AnalyticsTx[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("transactions")
      .select("transaction_type, amount:amount::text, transaction_date, category_id, schedule:recurring_schedules ( is_subscription )")
      .gte("transaction_date", start)
      .lte("transaction_date", end)
      .order("transaction_date")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Could not load analytics data: ${error.message}`);
    for (const r of (data ?? []) as unknown as (TxForCalc & { schedule: { is_subscription: boolean } | null })[]) {
      rows.push({
        transaction_type: r.transaction_type,
        amount: r.amount,
        transaction_date: r.transaction_date,
        category_id: r.category_id,
        is_subscription: Boolean(r.schedule?.is_subscription),
      });
    }
    if (!data || data.length < PAGE) return rows;
  }
}

type CategoryLite = Pick<Category, "id" | "name" | "icon" | "color" | "is_archived">;

export type BudgetHistoryPeriod = {
  id: string; // "2026-11" or "2026"
  totals: BudgetProgress;
  lines: { category: CategoryLite; progress: BudgetProgress }[];
};

/**
 * Budget history (FR-AN-008): allocations vs actual spending per period.
 * Monthly and yearly histories are built separately and never combined.
 */
export async function budgetHistory(
  periodType: "monthly" | "yearly",
  periods: string[],
  categoryFilter?: string,
): Promise<BudgetHistoryPeriod[]> {
  if (!periods.length) return [];
  const { supabase } = await requireUser();
  let query = supabase
    .from("budgets")
    .select("period_identifier, allocated:allocated_amount::text, category:categories!budgets_category_id_category_type_fkey ( id, name, icon, color, is_archived, sort_order )")
    .eq("period_type", periodType)
    .in("period_identifier", periods);
  if (categoryFilter) query = query.eq("category_id", categoryFilter);
  const { data, error } = await query;
  if (error) throw new Error(`Could not load budget history: ${error.message}`);

  type Row = { period_identifier: string; allocated: string; category: CategoryLite & { sort_order: number } };
  const rows = data as unknown as Row[];
  if (!rows.length) return [];

  const ranges = periods.map((p) => (periodType === "monthly" ? monthRange(p as MonthKey) : yearRange(Number(p))));
  const start = ranges.reduce((a, r) => (r.start < a ? r.start : a), ranges[0].start);
  const end = ranges.reduce((a, r) => (r.end > a ? r.end : a), ranges[0].end);
  const tx = await analyticsTransactions(start, end);

  const spentFor = (categoryId: string, s: IsoDate, e: IsoDate) =>
    sumMoney(tx.filter((t) => t.transaction_type === "expense" && t.category_id === categoryId && t.transaction_date >= s && t.transaction_date <= e).map((t) => t.amount));

  return periods
    .map((p, i) => {
      const { start: s, end: e } = ranges[i];
      const periodRows = rows.filter((r) => r.period_identifier === p).sort((a, b) => a.category.sort_order - b.category.sort_order);
      const lines = periodRows.map((r) => ({
        category: r.category,
        progress: budgetProgress(r.allocated, [spentFor(r.category.id, s, e).toFixed(2)]),
      }));
      return {
        id: p,
        lines,
        totals: budgetProgress(
          sumMoney(periodRows.map((r) => r.allocated)).toFixed(2),
          lines.map((l) => l.progress.spent.toFixed(2)),
        ),
      };
    })
    .filter((p) => p.lines.length > 0)
    .reverse(); // newest first
}

export function sumBy(tx: AnalyticsTx[], pred: (t: AnalyticsTx) => boolean): Decimal {
  return sumMoney(tx.filter(pred).map((t) => t.amount));
}
