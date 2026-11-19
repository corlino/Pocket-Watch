import "server-only";
import Decimal from "decimal.js";
import { requireUser } from "@/lib/auth/dal";
import { budgetProgress, expensesByCategory, type BudgetProgress, type TxForCalc } from "@/lib/calculations";
import { monthRange, yearRange, type IsoDate, type MonthKey } from "@/lib/dates/date-only";
import { sumMoney } from "@/lib/money";
import type { Category } from "@/features/transactions/types";

export type BudgetPeriod = { type: "monthly"; month: MonthKey } | { type: "yearly"; year: number };

export function periodIdentifier(p: BudgetPeriod): string {
  return p.type === "monthly" ? p.month : String(p.year);
}

export function periodRange(p: BudgetPeriod): { start: IsoDate; end: IsoDate } {
  return p.type === "monthly" ? monthRange(p.month) : yearRange(p.year);
}

type CategoryLite = Pick<Category, "id" | "name" | "icon" | "color" | "is_archived">;

export type BudgetLine = {
  id: string;
  allocated: string;
  category: CategoryLite;
  progress: BudgetProgress;
};

export type BudgetOverview = {
  lines: BudgetLine[];
  /** Expense categories with spending but no allocation this period (FR-BUD-010). */
  unbudgeted: { category: CategoryLite; spent: Decimal }[];
  totals: BudgetProgress;
  unbudgetedTotal: Decimal;
  allExpenses: Decimal;
};

/** Expense/income rows in a date range, in the shape the calculation layer expects. */
export async function transactionsInRange(start: IsoDate, end: IsoDate): Promise<TxForCalc[]> {
  const { supabase } = await requireUser();
  const rows: TxForCalc[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("transactions")
      .select("transaction_type, amount:amount::text, transaction_date, category_id")
      .gte("transaction_date", start)
      .lte("transaction_date", end)
      .order("transaction_date")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Could not load transactions: ${error.message}`);
    rows.push(...((data ?? []) as unknown as TxForCalc[]));
    if (!data || data.length < PAGE) return rows;
  }
}

/**
 * Budgets for one period with spending against each (PRD FR-BUD-001…010).
 * Monthly and yearly periods are computed independently — never combined.
 * "Total spent" covers budgeted categories; unbudgeted spending is reported
 * separately so utilisation stays meaningful.
 */
export async function getBudgetOverview(period: BudgetPeriod): Promise<BudgetOverview> {
  const { supabase } = await requireUser();
  const { start, end } = periodRange(period);

  const [budgetsRes, transactions, categoriesRes] = await Promise.all([
    supabase
      .from("budgets")
      .select(
        "id, allocated:allocated_amount::text, category:categories!budgets_category_id_category_type_fkey ( id, name, icon, color, is_archived, sort_order )",
      )
      .eq("period_type", period.type)
      .eq("period_identifier", periodIdentifier(period)),
    transactionsInRange(start, end),
    supabase.from("categories").select("id, name, icon, color, is_archived, sort_order").eq("category_type", "expense"),
  ]);
  if (budgetsRes.error) throw new Error(`Could not load budgets: ${budgetsRes.error.message}`);
  if (categoriesRes.error) throw new Error(`Could not load categories: ${categoriesRes.error.message}`);

  const spent = expensesByCategory(transactions, start, end);
  type Row = { id: string; allocated: string; category: CategoryLite & { sort_order: number } };
  const budgetRows = (budgetsRes.data as unknown as Row[]).sort((a, b) => a.category.sort_order - b.category.sort_order);

  const lines: BudgetLine[] = budgetRows.map((b) => ({
    id: b.id,
    allocated: b.allocated,
    category: b.category,
    progress: budgetProgress(b.allocated, [(spent.get(b.category.id) ?? new Decimal(0)).toFixed(2)]),
  }));

  const budgeted = new Set(budgetRows.map((b) => b.category.id));
  const catById = new Map(categoriesRes.data.map((c) => [c.id, c]));
  const unbudgeted = [...spent.entries()]
    .filter(([id]) => !budgeted.has(id))
    .map(([id, amount]) => ({ category: catById.get(id)!, spent: amount }))
    .filter((u) => u.category)
    .sort((a, b) => b.spent.comparedTo(a.spent));

  const totals = budgetProgress(
    sumMoney(budgetRows.map((b) => b.allocated)).toFixed(2),
    lines.map((l) => l.progress.spent.toFixed(2)),
  );
  const unbudgetedTotal = sumMoney(unbudgeted.map((u) => u.spent));

  return { lines, unbudgeted, totals, unbudgetedTotal, allExpenses: totals.spent.plus(unbudgetedTotal) };
}

export type SubscriptionRow = {
  id: string;
  description: string | null;
  amount: string;
  recurrence_interval: "weekly" | "monthly";
  next_scheduled_date: IsoDate;
  icon: string | null;
  category_id: string;
  notes: string | null;
  is_active: boolean;
  is_subscription: boolean;
  category: CategoryLite;
};

/** Active subscriptions — recurring expenses marked as subscriptions. */
export async function listSubscriptions(): Promise<SubscriptionRow[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("recurring_schedules")
    .select(
      `id, description, amount:amount::text, recurrence_interval, next_scheduled_date, icon, category_id, notes, is_active, is_subscription,
       category:categories!recurring_schedules_category_id_transaction_type_fkey ( id, name, icon, color, is_archived )`,
    )
    .eq("is_subscription", true)
    .eq("is_active", true)
    .order("next_scheduled_date");
  if (error) throw new Error(`Could not load subscriptions: ${error.message}`);
  return data as unknown as SubscriptionRow[];
}
