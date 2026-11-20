import "server-only";
import type { Appearance } from "@/lib/theme";
import { avatarUrl } from "@/features/profile/avatar";
import { cache } from "react";
import { requireUser } from "@/lib/auth/dal";
import { isIsoDate, isMonthKey, monthRange, yearRange, type IsoDate, type MonthKey } from "@/lib/dates/date-only";
import type { Category, DisplayPrefs, TransactionWithCategory } from "./types";

// amount::text keeps NUMERIC exact (PostgREST would otherwise send a JSON number).
const TX_SELECT = `
  id, transaction_type, amount:amount::text, description, notes, transaction_date, source, created_at, recurring_schedule_id,
  category:categories!transactions_category_id_transaction_type_fkey ( id, name, icon, color, is_archived ),
  schedule:recurring_schedules ( id, is_active, recurrence_interval, next_scheduled_date, is_subscription, amount:amount::text, category_id, description, notes )
` as const;

export type TransactionFilters = {
  q?: string;
  type?: "income" | "expense";
  categoryId?: string;
  month?: MonthKey;
  year?: number;
  from?: IsoDate;
  to?: IsoDate;
};

/** Parse URL search params into validated filters (ignores anything invalid). */
export function parseFilters(params: Record<string, string | string[] | undefined>): TransactionFilters {
  const get = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const filters: TransactionFilters = {};
  const q = get("q")?.trim();
  if (q) filters.q = q.slice(0, 100);
  const type = get("type");
  if (type === "income" || type === "expense") filters.type = type;
  const category = get("category");
  if (category && /^[0-9a-f-]{36}$/i.test(category)) filters.categoryId = category;
  const month = get("month");
  if (month && isMonthKey(month)) filters.month = month;
  const year = Number(get("year"));
  if (Number.isInteger(year) && year >= 1900 && year <= 2200) filters.year = year;
  const from = get("from");
  if (from && isIsoDate(from)) filters.from = from;
  const to = get("to");
  if (to && isIsoDate(to)) filters.to = to;
  return filters;
}

/** Explicit from/to wins; otherwise month, otherwise year. */
export function filterDateRange(f: TransactionFilters): { start?: IsoDate; end?: IsoDate } {
  if (f.from || f.to) return { start: f.from, end: f.to };
  if (f.month) return monthRange(f.month);
  if (f.year) return yearRange(f.year);
  return {};
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function listTransactions(
  filters: TransactionFilters,
  { limit = 50 }: { limit?: number } = {},
): Promise<{ rows: TransactionWithCategory[]; hasMore: boolean }> {
  const { supabase } = await requireUser();
  let query = supabase
    .from("transactions")
    .select(TX_SELECT)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (filters.type) query = query.eq("transaction_type", filters.type);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.q) query = query.ilike("description", `%${escapeLike(filters.q)}%`);
  const { start, end } = filterDateRange(filters);
  if (start) query = query.gte("transaction_date", start);
  if (end) query = query.lte("transaction_date", end);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load transactions: ${error.message}`);
  const rows = (data ?? []) as unknown as TransactionWithCategory[];
  return { rows: rows.slice(0, limit), hasMore: rows.length > limit };
}

export const listCategories = cache(async (): Promise<Category[]> => {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, category_type, icon, color, is_archived, sort_order")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return data as Category[];
});

export const getDisplayPrefs = cache(async (): Promise<DisplayPrefs> => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("preferences").select("currency_display, date_format, number_format").maybeSingle();
  return {
    currency: (data?.currency_display as DisplayPrefs["currency"]) ?? "CAD",
    dateFormat: (data?.date_format as DisplayPrefs["dateFormat"]) ?? "MM/DD/YYYY",
    numberFormat: (data?.number_format as DisplayPrefs["numberFormat"]) ?? "comma-dot",
  };
});

export const getProfile = cache(async () => {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.from("profiles").select("display_name, notifications_seen_at, avatar_path").eq("id", userId).maybeSingle();
  return {
    displayName: data?.display_name ?? "Colin",
    notificationsSeenAt: data?.notifications_seen_at ?? null,
    avatarUrl: avatarUrl(data?.avatar_path ?? null),
  };
});

export type ScheduleWithCategory = import("./types").ScheduleSummary & {
  transaction_type: "income" | "expense";
  original_start_date: string;
  category: { id: string; name: string; icon: string | null; color: string; is_archived: boolean };
};

/** Every recurring schedule, active first, soonest next date first. */
export async function listSchedules(): Promise<ScheduleWithCategory[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("recurring_schedules")
    .select(
      `id, is_active, recurrence_interval, next_scheduled_date, is_subscription, amount:amount::text, category_id, description, notes,
       transaction_type, original_start_date,
       category:categories!recurring_schedules_category_id_transaction_type_fkey ( id, name, icon, color, is_archived )`,
    )
    .order("is_active", { ascending: false })
    .order("next_scheduled_date");
  if (error) throw new Error(`Could not load recurring schedules: ${error.message}`);
  return data as unknown as ScheduleWithCategory[];
}

/** Bell: transactions the scheduler created, newest first, with unread count. */
export async function getAutoAddedTransactions(limit = 20) {
  const { supabase } = await requireUser();
  const { notificationsSeenAt } = await getProfile();
  const { data, error } = await supabase
    .from("transactions")
    .select(TX_SELECT)
    .eq("source", "recurring")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load notifications: ${error.message}`);
  const rows = (data ?? []) as unknown as TransactionWithCategory[];
  const unread = notificationsSeenAt ? rows.filter((r) => r.created_at > notificationsSeenAt).length : rows.length;
  return { rows, unread };
}

/** Appearance preference (dark | light | system). */
export const getAppearance = cache(async (): Promise<Appearance> => {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("preferences").select("appearance").maybeSingle();
  return (data?.appearance as Appearance | undefined) ?? "dark";
});
