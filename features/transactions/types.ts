import type { IsoDate } from "@/lib/dates/date-only";
import type { RecurrenceInterval } from "@/lib/dates/recurrence";
import type { MoneyString } from "@/lib/money";

export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  category_type: TransactionType;
  icon: string | null;
  color: string;
  is_archived: boolean;
  sort_order: number;
};

export type ScheduleSummary = {
  id: string;
  is_active: boolean;
  recurrence_interval: RecurrenceInterval;
  next_scheduled_date: IsoDate;
  is_subscription: boolean;
  amount: MoneyString;
  category_id: string;
  description: string | null;
  notes: string | null;
};

export type TransactionWithCategory = {
  id: string;
  transaction_type: TransactionType;
  amount: MoneyString;
  description: string | null;
  notes: string | null;
  transaction_date: IsoDate;
  source: "manual" | "recurring";
  created_at: string;
  recurring_schedule_id: string | null;
  category: Pick<Category, "id" | "name" | "icon" | "color" | "is_archived">;
  schedule: ScheduleSummary | null;
};

export type DisplayPrefs = {
  currency: "CAD" | "USD" | "EUR" | "GBP";
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  numberFormat: "comma-dot" | "space-comma" | "dot-comma";
};

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };
