import "server-only";
import { requireUser } from "@/lib/auth/dal";
import type { Category } from "@/features/transactions/types";

export type CategoryWithUsage = Category & { transactionCount: number; activeScheduleCount: number };

/** Categories plus how many transactions / active schedules use each one. */
export async function listCategoriesWithUsage(): Promise<CategoryWithUsage[]> {
  const { supabase } = await requireUser();
  const [cats, schedules] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, category_type, icon, color, is_archived, sort_order, transactions!transactions_category_id_transaction_type_fkey(count)")
      .order("sort_order")
      .order("name"),
    supabase.from("recurring_schedules").select("category_id").eq("is_active", true),
  ]);
  if (cats.error) throw new Error(`Could not load categories: ${cats.error.message}`);
  if (schedules.error) throw new Error(`Could not load schedules: ${schedules.error.message}`);

  const scheduleCounts = new Map<string, number>();
  for (const s of schedules.data) scheduleCounts.set(s.category_id, (scheduleCounts.get(s.category_id) ?? 0) + 1);

  return cats.data.map(({ transactions, ...c }) => ({
    ...(c as Category),
    transactionCount: (transactions as unknown as { count: number }[])[0]?.count ?? 0,
    activeScheduleCount: scheduleCounts.get(c.id) ?? 0,
  }));
}
