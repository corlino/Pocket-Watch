/**
 * Backup validation (PRD §10.2: "Restoration must include validation").
 * Used in the browser for the preview and again on the server before the
 * restore runs. Checks shape, types, money/date formats, duplicates and every
 * cross-reference, so a bad file is rejected with a plain-language reason
 * before anything is deleted.
 */
import { z } from "zod";
import { isIsoDate } from "@/lib/dates/date-only";

export const MAX_BACKUP_BYTES = 4 * 1024 * 1024; // within Vercel's request body limit

const uuid = z.uuid();
const money = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, "invalid amount");
const date = z.string().refine(isIsoDate, "invalid date");
const ts = z.string().optional().nullable();
const type = z.enum(["income", "expense"]);

const category = z.object({
  id: uuid,
  name: z.string().trim().min(1).max(40),
  category_type: type,
  icon: z.string().regex(/^[a-z0-9-]{1,40}$/).nullable().optional(),
  color: z.enum(["cyan", "yellow", "mint", "coral", "purple", "blue", "muted"]).optional(),
  is_archived: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  created_at: ts,
  updated_at: ts,
});

const schedule = z.object({
  id: uuid,
  transaction_type: type,
  category_id: uuid,
  amount: money,
  description: z.string().max(100).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  recurrence_interval: z.enum(["weekly", "monthly"]),
  original_start_date: date,
  next_scheduled_date: date,
  anchor_day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  is_active: z.boolean().optional(),
  is_subscription: z.boolean().optional(),
  icon: z.string().nullable().optional(),
  created_at: ts,
  updated_at: ts,
});

const transaction = z.object({
  id: uuid,
  transaction_type: type,
  category_id: uuid,
  amount: money,
  description: z.string().max(100).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  transaction_date: date,
  recurring_schedule_id: uuid.nullable().optional(),
  scheduled_for: date.nullable().optional(),
  source: z.enum(["manual", "recurring"]).optional(),
  created_at: ts,
  updated_at: ts,
});

const budget = z.object({
  id: uuid,
  category_id: uuid,
  allocated_amount: z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, "invalid amount"),
  period_type: z.enum(["monthly", "yearly"]),
  period_identifier: z.string(),
  created_at: ts,
  updated_at: ts,
});

export const backupSchema = z.object({
  format: z.literal("pocket-watch-backup", { message: "This isn't a Pocket Watch backup file." }),
  version: z.literal(1, { message: "This backup was made by a newer version of Pocket Watch." }),
  exported_at: z.string(),
  data: z.object({
    profile: z.object({ display_name: z.string().min(1).max(50) }).partial().nullable().optional(),
    preferences: z
      .object({
        currency_display: z.enum(["CAD", "USD", "EUR", "GBP"]),
        date_format: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
        number_format: z.enum(["comma-dot", "space-comma", "dot-comma"]),
        appearance: z.enum(["dark", "light", "system"]),
      })
      .partial()
      .nullable()
      .optional(),
    categories: z.array(category),
    recurring_schedules: z.array(schedule),
    transactions: z.array(transaction),
    budgets: z.array(budget),
  }),
});

export type Backup = z.infer<typeof backupSchema>;

export type BackupSummary = {
  exportedAt: string;
  counts: { categories: number; recurring_schedules: number; transactions: number; budgets: number };
  firstDate: string | null;
  lastDate: string | null;
};

export type ValidationResult = { ok: true; backup: Backup; summary: BackupSummary } | { ok: false; errors: string[] };

function describeZod(error: z.ZodError): string[] {
  return error.issues.slice(0, 5).map((i) => {
    const where = i.path.length ? i.path.join(" → ") : "file";
    return `${where}: ${i.message}`;
  });
}

/** Full validation, including cross-references. */
export function validateBackup(input: unknown): ValidationResult {
  const parsed = backupSchema.safeParse(input);
  if (!parsed.success) {
    const top = parsed.error.issues.find((i) => i.path[0] === "format" || i.path[0] === "version");
    return { ok: false, errors: top ? [top.message] : ["The file isn't a valid Pocket Watch backup.", ...describeZod(parsed.error)] };
  }
  const b = parsed.data;
  const errors: string[] = [];
  const d = b.data;

  const uniqueIds = (rows: { id: string }[], label: string) => {
    const seen = new Set<string>();
    for (const r of rows) {
      if (seen.has(r.id)) errors.push(`Duplicate ${label} id ${r.id}.`);
      seen.add(r.id);
    }
  };
  uniqueIds(d.categories, "category");
  uniqueIds(d.recurring_schedules, "recurring schedule");
  uniqueIds(d.transactions, "transaction");
  uniqueIds(d.budgets, "budget");

  const cats = new Map(d.categories.map((c) => [c.id, c]));
  const names = new Set<string>();
  for (const c of d.categories) {
    const key = `${c.category_type}:${c.name.trim().toLowerCase()}`;
    if (names.has(key)) errors.push(`Two ${c.category_type} categories are named "${c.name}".`);
    names.add(key);
  }

  const checkCategory = (categoryId: string, t: "income" | "expense", label: string) => {
    const c = cats.get(categoryId);
    if (!c) errors.push(`${label} refers to a category that isn't in the backup.`);
    else if (c.category_type !== t) errors.push(`${label} uses ${c.category_type} category "${c.name}" for a ${t}.`);
  };

  const schedules = new Map(d.recurring_schedules.map((s) => [s.id, s]));
  for (const s of d.recurring_schedules) {
    checkCategory(s.category_id, s.transaction_type, `Recurring schedule "${s.description ?? s.id}"`);
    if (s.next_scheduled_date < s.original_start_date) errors.push(`Recurring schedule "${s.description ?? s.id}" has its next date before its start.`);
    if ((s.recurrence_interval === "monthly") !== (s.anchor_day_of_month != null)) errors.push(`Recurring schedule "${s.description ?? s.id}" has an inconsistent monthly anchor.`);
    if (s.is_subscription && s.transaction_type !== "expense") errors.push(`Subscription "${s.description ?? s.id}" must be an expense.`);
  }

  const occurrences = new Set<string>();
  for (const t of d.transactions) {
    checkCategory(t.category_id, t.transaction_type, `Transaction on ${t.transaction_date}`);
    if (Number(t.amount) <= 0) errors.push(`Transaction on ${t.transaction_date} has a zero amount.`);
    if (t.recurring_schedule_id && !schedules.has(t.recurring_schedule_id)) errors.push(`Transaction on ${t.transaction_date} refers to a missing recurring schedule.`);
    if (t.recurring_schedule_id && t.scheduled_for) {
      const key = `${t.recurring_schedule_id}:${t.scheduled_for}`;
      if (occurrences.has(key)) errors.push(`Two transactions fill the same recurring occurrence on ${t.scheduled_for}.`);
      occurrences.add(key);
    }
  }

  const periods = new Set<string>();
  for (const bu of d.budgets) {
    const c = cats.get(bu.category_id);
    if (!c) errors.push(`A budget refers to a category that isn't in the backup.`);
    else if (c.category_type !== "expense") errors.push(`Income category "${c.name}" can't have a budget.`);
    const okId = bu.period_type === "monthly" ? /^\d{4}-(0[1-9]|1[0-2])$/.test(bu.period_identifier) : /^\d{4}$/.test(bu.period_identifier);
    if (!okId) errors.push(`A budget has an invalid period "${bu.period_identifier}".`);
    const key = `${bu.category_id}:${bu.period_type}:${bu.period_identifier}`;
    if (periods.has(key)) errors.push(`Duplicate budget for "${c?.name ?? bu.category_id}" in ${bu.period_identifier}.`);
    periods.add(key);
  }

  if (errors.length) return { ok: false, errors: [...new Set(errors)].slice(0, 8) };

  const dates = d.transactions.map((t) => t.transaction_date).sort();
  return {
    ok: true,
    backup: b,
    summary: {
      exportedAt: b.exported_at,
      counts: {
        categories: d.categories.length,
        recurring_schedules: d.recurring_schedules.length,
        transactions: d.transactions.length,
        budgets: d.budgets.length,
      },
      firstDate: dates[0] ?? null,
      lastDate: dates[dates.length - 1] ?? null,
    },
  };
}
