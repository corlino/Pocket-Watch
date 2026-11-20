/**
 * Backup → restore round trip against the real migrations (PGlite), plus
 * rollback on failure and the validator's cross-reference checks.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import { validateBackup } from "@/features/backup/validate";

const OWNER = "00000000-0000-4000-8000-000000000001";
const STUB = `
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

let db: PGlite;

async function asOwner<T>(fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${OWNER}', false);`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role;`);
  }
}

/** Mirrors features/backup/export.ts output (amounts as exact text). */
async function exportBackup() {
  const q = async (sql: string) => (await db.query(sql)).rows;
  const [profile] = await q(`select display_name from public.profiles`);
  const [preferences] = await q(`select currency_display, date_format, number_format, appearance::text as appearance from public.preferences`);
  return JSON.parse(
    JSON.stringify({
      format: "pocket-watch-backup",
      version: 1,
      exported_at: "2026-11-20T00:00:00.000Z",
      data: {
        profile,
        preferences,
        categories: await q(`select id, name, category_type::text as category_type, icon, color, is_archived, sort_order from public.categories order by id`),
        recurring_schedules: await q(`select id, transaction_type::text as transaction_type, category_id, amount::text as amount, description, notes, recurrence_interval::text as recurrence_interval, to_char(original_start_date,'YYYY-MM-DD') as original_start_date, to_char(next_scheduled_date,'YYYY-MM-DD') as next_scheduled_date, anchor_day_of_month, is_active, is_subscription, icon from public.recurring_schedules order by id`),
        transactions: await q(`select id, transaction_type::text as transaction_type, category_id, amount::text as amount, description, notes, to_char(transaction_date,'YYYY-MM-DD') as transaction_date, recurring_schedule_id, to_char(scheduled_for,'YYYY-MM-DD') as scheduled_for, source::text as source from public.transactions order by id`),
        budgets: await q(`select id, category_id, allocated_amount::text as allocated_amount, period_type::text as period_type, period_identifier from public.budgets order by id`),
      },
    }),
  );
}

beforeEach(async () => {
  db = new PGlite();
  await db.exec(STUB);
  for (const f of readdirSync(join(process.cwd(), "supabase", "migrations")).filter((x) => x.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(process.cwd(), "supabase", "migrations", f), "utf8"));
  }
  await db.query(`insert into auth.users (id) values ($1)`, [OWNER]);
  // Realistic data: a recurring schedule with generated rows, a budget, an archived category with history.
  await asOwner(async () => {
    const cat = async (n: string) => (await db.query<{ id: string }>(`select id from public.categories where name = $1`, [n])).rows[0].id;
    await db.query(`select public.create_recurring_schedule('expense', $1, 15.99, 'Netflix', null, 'monthly', '2026-09-30', '2026-11-30', true, true, 'tv')`, [await cat("Subscriptions")]);
    await db.query(`insert into public.transactions (transaction_type, category_id, amount, transaction_date, description) values ('expense', $1, 12.34, '2026-10-02', 'Ticket, "VIP"')`, [await cat("Travel")]);
    await db.query(`insert into public.budgets (category_id, allocated_amount, period_type, period_identifier) values ($1, 0, 'monthly', '2026-11'), ($1, 400, 'yearly', '2026')`, [await cat("Groceries")]);
    await db.query(`update public.categories set is_archived = true where name = 'Travel'`);
    await db.query(`update public.profiles set display_name = 'Colin O'`);
    await db.query(`update public.preferences set currency_display = 'EUR', appearance = 'light'`);
  });
});

describe("restore_backup", () => {
  it("round-trips every record, relationship and preference exactly", async () => {
    const before = await exportBackup();
    expect(validateBackup(before)).toMatchObject({ ok: true, summary: { counts: { transactions: 4, recurring_schedules: 1, budgets: 2 } } });

    // Wreck the current data, then restore.
    await asOwner(() => db.exec(`delete from public.transactions; delete from public.budgets; update public.profiles set display_name = 'Someone'`));
    const counts = await asOwner(async () => (await db.query<{ r: Record<string, number> }>(`select public.restore_backup($1::jsonb) as r`, [JSON.stringify(before)])).rows[0].r);
    expect(counts).toEqual({ categories: 19, recurring_schedules: 1, transactions: 4, budgets: 2 });

    const after = await exportBackup();
    expect(after).toEqual(before);
  });

  it("keeps archived categories archived, with their history", async () => {
    const backup = await exportBackup();
    await asOwner(() => db.query(`select public.restore_backup($1::jsonb)`, [JSON.stringify(backup)]));
    const r = await db.query<{ is_archived: boolean; n: number }>(
      `select c.is_archived, count(t.id)::int as n from public.categories c left join public.transactions t on t.category_id = c.id where c.name = 'Travel' group by c.is_archived`,
    );
    expect(r.rows[0]).toEqual({ is_archived: true, n: 1 });
  });

  it("rolls back completely when the backup is inconsistent", async () => {
    const backup = await exportBackup();
    const countBefore = (await db.query<{ n: number }>(`select count(*)::int as n from public.transactions`)).rows[0].n;
    backup.data.transactions[0].category_id = "00000000-0000-4000-8000-00000000dead";
    await expect(asOwner(() => db.query(`select public.restore_backup($1::jsonb)`, [JSON.stringify(backup)]))).rejects.toThrow();
    const countAfter = (await db.query<{ n: number }>(`select count(*)::int as n from public.transactions`)).rows[0].n;
    expect(countAfter).toBe(countBefore);
  });

  it("rejects other formats and anonymous callers", async () => {
    await expect(asOwner(() => db.query(`select public.restore_backup('{"format":"x","version":1}'::jsonb)`))).rejects.toThrow(/Unsupported/);
    await db.exec(`set role anon;`);
    await expect(db.query(`select public.restore_backup('{}'::jsonb)`)).rejects.toThrow(/permission denied/);
    await db.exec(`reset role;`);
  });
});

describe("validateBackup", () => {
  it("explains what's wrong with a broken file", async () => {
    const b = await exportBackup();
    expect(validateBackup({ hello: "world" })).toEqual({ ok: false, errors: ["This isn't a Pocket Watch backup file."] });
    const bad = structuredClone(b);
    bad.data.transactions[0].category_id = bad.data.categories.find((c: { category_type: string }) => c.category_type === "income").id;
    bad.data.budgets.push({ ...bad.data.budgets[0] , id: "00000000-0000-4000-8000-0000000000aa" });
    const r = validateBackup(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => e.includes("income category"))).toBe(true);
      expect(r.errors.some((e) => e.startsWith("Duplicate budget"))).toBe(true);
    }
  });
});
