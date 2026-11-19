import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Full-data JSON export (PRD FR-PRO-008, TAD §14.1). Runs as the signed-in
 * administrator, so RLS applies. Money is exported as exact decimal strings.
 * The shape is versioned so the Phase 4 restore can validate it.
 */
export const BACKUP_FORMAT = "pocket-watch-backup";
export const BACKUP_VERSION = 1;

const PAGE = 1000; // PostgREST's default max rows per request

type Client = SupabaseClient<Database>;

async function readAll(supabase: Client, table: keyof Database["public"]["Tables"], select: string, order: string) {
  const rows: unknown[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(order)
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Could not export ${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

export async function buildBackup(supabase: Client, exportedAt: Date) {
  const [profile, preferences, categories, schedules, transactions, budgets] = await Promise.all([
    readAll(supabase, "profiles", "display_name, created_at, updated_at", "created_at"),
    readAll(supabase, "preferences", "currency_display, date_format, number_format, appearance, created_at, updated_at", "created_at"),
    readAll(supabase, "categories", "id, name, category_type, icon, color, is_archived, sort_order, created_at, updated_at", "created_at"),
    readAll(
      supabase,
      "recurring_schedules",
      "id, transaction_type, category_id, amount:amount::text, description, notes, recurrence_interval, original_start_date, next_scheduled_date, anchor_day_of_month, is_active, is_subscription, icon, created_at, updated_at",
      "created_at",
    ),
    readAll(
      supabase,
      "transactions",
      "id, transaction_type, category_id, amount:amount::text, description, notes, transaction_date, recurring_schedule_id, scheduled_for, source, created_at, updated_at",
      "transaction_date",
    ),
    readAll(supabase, "budgets", "id, category_id, allocated_amount:allocated_amount::text, period_type, period_identifier, created_at, updated_at", "created_at"),
  ]);

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exported_at: exportedAt.toISOString(),
    counts: {
      categories: categories.length,
      recurring_schedules: schedules.length,
      transactions: transactions.length,
      budgets: budgets.length,
    },
    data: {
      profile: profile[0] ?? null,
      preferences: preferences[0] ?? null,
      categories,
      recurring_schedules: schedules,
      transactions,
      budgets,
    },
  };
}
