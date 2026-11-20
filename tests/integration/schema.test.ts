/**
 * Runs the real Supabase migrations in an embedded Postgres (PGlite) with a
 * minimal stand-in for Supabase's auth schema and roles, then exercises the
 * constraints, RLS and recurring-generation functions.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");
const OWNER = "00000000-0000-4000-8000-000000000001";
const INTRUDER = "00000000-0000-4000-8000-000000000002";

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  -- Minimal Supabase Storage stand-in (profile photos).
  create schema storage;
  create table storage.buckets (id text primary key, name text not null, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets (id), name text not null, owner uuid);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  grant usage on schema storage to anon, authenticated, service_role;
  grant all on storage.objects to authenticated, service_role;
  grant select on storage.buckets to anon, authenticated, service_role;
`;

let db: PGlite;

async function freshDb() {
  const pg = new PGlite();
  await pg.exec(SUPABASE_STUB);
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort()) {
    await pg.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }
  await pg.query(`insert into auth.users (id, email) values ($1, 'owner@example.test')`, [OWNER]);
  return pg;
}

/** Run statements as the authenticated admin (RLS applies). */
async function asOwner<T>(fn: () => Promise<T>, uid = OWNER): Promise<T> {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false);`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  }
}

async function categoryId(name: string): Promise<string> {
  const r = await db.query<{ id: string }>(`select id from public.categories where name = $1`, [name]);
  return r.rows[0].id;
}

async function createSchedule(opts: {
  type?: "income" | "expense";
  category: string;
  amount?: string;
  interval: "weekly" | "monthly";
  start: string;
  today: string;
  recordFirst?: boolean;
  subscription?: boolean;
}): Promise<string> {
  const cat = await categoryId(opts.category);
  return asOwner(async () => {
    const r = await db.query<{ id: string }>(
      `select public.create_recurring_schedule($1, $2, $3, 'Test', null, $4, $5, $6, $7, $8, null) as id`,
      [opts.type ?? "expense", cat, opts.amount ?? "10.00", opts.interval, opts.start, opts.today, opts.recordFirst ?? true, opts.subscription ?? false],
    );
    return r.rows[0].id;
  });
}

async function txDates(scheduleId: string): Promise<string[]> {
  const r = await db.query<{ d: string }>(
    `select to_char(transaction_date, 'YYYY-MM-DD') as d from public.transactions where recurring_schedule_id = $1 order by transaction_date`,
    [scheduleId],
  );
  return r.rows.map((row) => row.d);
}

async function nextDate(scheduleId: string): Promise<string> {
  const r = await db.query<{ d: string }>(
    `select to_char(next_scheduled_date, 'YYYY-MM-DD') as d from public.recurring_schedules where id = $1`,
    [scheduleId],
  );
  return r.rows[0].d;
}

async function processAsService(today: string) {
  await db.exec(`set role service_role;`);
  try {
    const r = await db.query<{ schedules_processed: number; transactions_created: number }>(
      `select * from public.process_recurring_schedules($1)`,
      [today],
    );
    return r.rows[0];
  } finally {
    await db.exec(`reset role;`);
  }
}

beforeEach(async () => {
  db = await freshDb();
});

describe("bootstrap", () => {
  it("creates profile, preferences and the PRD default categories for the admin", async () => {
    const profile = await db.query<{ display_name: string }>(`select display_name from public.profiles`);
    expect(profile.rows[0].display_name).toBe("Colin");
    const prefs = await db.query<{ currency_display: string; date_format: string }>(
      `select currency_display, date_format from public.preferences`,
    );
    expect(prefs.rows[0]).toEqual({ currency_display: "CAD", date_format: "MM/DD/YYYY" });
    const counts = await db.query<{ category_type: string; n: number }>(
      `select category_type, count(*)::int as n from public.categories group by 1 order by 1`,
    );
    expect(counts.rows).toEqual([
      { category_type: "income", n: 6 },
      { category_type: "expense", n: 13 },
    ]);
    const savings = await db.query(`select 1 from public.categories where name ilike 'savings'`);
    expect(savings.rows).toHaveLength(0);
  });
});

describe("integrity constraints", () => {
  it("rejects duplicate category names within a type, case-insensitively", async () => {
    await expect(
      asOwner(() => db.query(`insert into public.categories (name, category_type) values (' groceries ', 'expense')`)),
    ).rejects.toThrow(/categories_owner_type_name_key/);
  });

  it("allows the same name across income and expense", async () => {
    await asOwner(() => db.query(`insert into public.categories (name, category_type) values ('Salary', 'expense')`));
  });

  it("rejects an expense category on an income transaction", async () => {
    const groceries = await categoryId("Groceries");
    await expect(
      asOwner(() =>
        db.query(
          `insert into public.transactions (transaction_type, category_id, amount, transaction_date) values ('income', $1, 5, '2026-11-19')`,
          [groceries],
        ),
      ),
    ).rejects.toThrow(/foreign key/);
  });

  it("rejects zero and negative transaction amounts but allows identical duplicates", async () => {
    const groceries = await categoryId("Groceries");
    const insert = (amount: string) =>
      asOwner(() =>
        db.query(
          `insert into public.transactions (transaction_type, category_id, amount, transaction_date) values ('expense', $1, $2, '2026-11-19')`,
          [groceries, amount],
        ),
      );
    await expect(insert("0")).rejects.toThrow(/check/);
    await expect(insert("-1")).rejects.toThrow(/check/);
    await insert("4.99");
    await insert("4.99");
  });

  it("allows zero budgets, enforces one per category and period, and blocks income categories", async () => {
    const groceries = await categoryId("Groceries");
    const salary = await categoryId("Salary");
    const insert = (cat: string, type: string, id: string, amount = "0") =>
      asOwner(() =>
        db.query(
          `insert into public.budgets (category_id, allocated_amount, period_type, period_identifier) values ($1, $2, $3, $4)`,
          [cat, amount, type, id],
        ),
      );
    await insert(groceries, "monthly", "2026-11");
    await insert(groceries, "yearly", "2026", "6000");
    await expect(insert(groceries, "monthly", "2026-11")).rejects.toThrow(/unique|duplicate/);
    await expect(insert(groceries, "monthly", "2026-13")).rejects.toThrow(/check/);
    await expect(insert(salary, "monthly", "2026-11")).rejects.toThrow(/foreign key/);
  });

  it("blocks archived categories for new manual transactions and budgets", async () => {
    const travel = await categoryId("Travel");
    await asOwner(() => db.query(`update public.categories set is_archived = true where id = $1`, [travel]));
    await expect(
      asOwner(() =>
        db.query(
          `insert into public.transactions (transaction_type, category_id, amount, transaction_date) values ('expense', $1, 5, '2026-11-19')`,
          [travel],
        ),
      ),
    ).rejects.toThrow(/archived/);
    await expect(
      asOwner(() =>
        db.query(
          `insert into public.budgets (category_id, allocated_amount, period_type, period_identifier) values ($1, 1, 'monthly', '2026-11')`,
          [travel],
        ),
      ),
    ).rejects.toThrow(/archived/);
  });

  it("prevents deleting a category that has transactions", async () => {
    const groceries = await categoryId("Groceries");
    await asOwner(() =>
      db.query(
        `insert into public.transactions (transaction_type, category_id, amount, transaction_date) values ('expense', $1, 5, '2026-11-19')`,
        [groceries],
      ),
    );
    await expect(asOwner(() => db.query(`delete from public.categories where id = $1`, [groceries]))).rejects.toThrow(
      /foreign key/,
    );
  });
});

describe("row level security", () => {
  it("hides all financial data from another authenticated user", async () => {
    const r = await asOwner(() => db.query(`select count(*)::int as n from public.categories`), INTRUDER);
    expect(r.rows[0]).toEqual({ n: 0 });
  });

  it("denies anonymous access entirely", async () => {
    await db.exec(`set role anon;`);
    try {
      await expect(db.query(`select * from public.transactions`)).rejects.toThrow(/permission denied/);
    } finally {
      await db.exec(`reset role;`);
    }
  });

  it("only lets the service role run the daily job", async () => {
    await expect(asOwner(() => db.query(`select * from public.process_recurring_schedules('2026-11-19')`))).rejects.toThrow(
      /permission denied/,
    );
  });
});

describe("profile photo storage", () => {
  const path = (uid: string) => `${uid}/avatar-1763600000000.jpg`;

  it("creates a private avatars bucket that only accepts JPEGs", async () => {
    const r = await db.query<{ public: boolean; allowed_mime_types: string[] }>(`select public, allowed_mime_types from storage.buckets where id = 'avatars'`);
    expect(r.rows[0]).toEqual({ public: false, allowed_mime_types: ["image/jpeg"] });
  });

  it("lets the owner write and read only inside their own folder", async () => {
    await asOwner(() => db.query(`insert into storage.objects (bucket_id, name) values ('avatars', $1)`, [path(OWNER)]));
    await expect(
      asOwner(() => db.query(`insert into storage.objects (bucket_id, name) values ('avatars', $1)`, [path(INTRUDER)])),
    ).rejects.toThrow(/row-level security/);
    const seen = await asOwner(() => db.query(`select name from storage.objects`), INTRUDER);
    expect(seen.rows).toHaveLength(0);
  });

  it("only stores well-formed photo paths on the profile", async () => {
    await asOwner(() => db.query(`update public.profiles set avatar_path = $1 where id = $2`, [path(OWNER), OWNER]));
    await expect(
      asOwner(() => db.query(`update public.profiles set avatar_path = '../etc/passwd' where id = $1`, [OWNER])),
    ).rejects.toThrow(/check constraint/);
  });

  it("accepts the new colour themes", async () => {
    for (const theme of ["dark-red", "dark-purple", "yellow"]) {
      await asOwner(() => db.query(`update public.preferences set appearance = $1`, [theme]));
    }
    const r = await db.query<{ appearance: string }>(`select appearance from public.preferences`);
    expect(r.rows[0].appearance).toBe("yellow");
  });
});

describe("recurring transactions", () => {
  it("saves the first transaction immediately and schedules the next (FR-TRANS-013)", async () => {
    const id = await createSchedule({ category: "Salary", type: "income", interval: "weekly", start: "2026-11-19", today: "2026-11-19" });
    expect(await txDates(id)).toEqual(["2026-11-19"]);
    expect(await nextDate(id)).toBe("2026-11-26");
  });

  it("generates on the scheduled date and is idempotent on re-runs (TAD §7.4)", async () => {
    const id = await createSchedule({ category: "Groceries", interval: "weekly", start: "2026-11-19", today: "2026-11-19" });
    expect(await processAsService("2026-11-25")).toEqual({ schedules_processed: 0, transactions_created: 0 });
    expect(await processAsService("2026-11-26")).toEqual({ schedules_processed: 1, transactions_created: 1 });
    expect(await processAsService("2026-11-26")).toEqual({ schedules_processed: 0, transactions_created: 0 });
    expect(await txDates(id)).toEqual(["2026-11-19", "2026-11-26"]);
    const src = await db.query<{ source: string }>(
      `select source from public.transactions where recurring_schedule_id = $1 order by transaction_date`,
      [id],
    );
    expect(src.rows.map((r) => r.source)).toEqual(["manual", "recurring"]);
  });

  it("catches up every missed occurrence with original dates (FR-TRANS-018)", async () => {
    const id = await createSchedule({ category: "Groceries", interval: "weekly", start: "2026-11-01", today: "2026-11-01" });
    const r = await processAsService("2026-11-22");
    expect(r.transactions_created).toBe(3);
    expect(await txDates(id)).toEqual(["2026-11-01", "2026-11-08", "2026-11-15", "2026-11-22"]);
    expect(await nextDate(id)).toBe("2026-11-29");
  });

  it("generates back-dated occurrences immediately on creation", async () => {
    const id = await createSchedule({ category: "Housing", interval: "monthly", start: "2026-09-01", today: "2026-11-19" });
    expect(await txDates(id)).toEqual(["2026-09-01", "2026-10-01", "2026-11-01"]);
    expect(await nextDate(id)).toBe("2026-12-01");
  });

  it("keeps the monthly anchor across short months (FR-TRANS-019)", async () => {
    const id = await createSchedule({ category: "Housing", interval: "monthly", start: "2026-01-31", today: "2026-01-31" });
    await processAsService("2026-05-31");
    expect(await txDates(id)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30", "2026-05-31"]);
  });

  it("does not regenerate an occurrence after the user deletes it (FR-TRANS-017)", async () => {
    const id = await createSchedule({ category: "Groceries", interval: "weekly", start: "2026-11-19", today: "2026-11-19" });
    await processAsService("2026-11-26");
    await asOwner(() =>
      db.query(`delete from public.transactions where recurring_schedule_id = $1 and transaction_date = '2026-11-26'`, [id]),
    );
    await processAsService("2026-11-26");
    expect(await txDates(id)).toEqual(["2026-11-19"]);
    await processAsService("2026-12-03");
    expect(await txDates(id)).toEqual(["2026-11-19", "2026-12-03"]);
  });

  it("does not reopen a slot when a generated transaction's date is edited", async () => {
    const id = await createSchedule({ category: "Groceries", interval: "weekly", start: "2026-11-19", today: "2026-11-19" });
    await processAsService("2026-11-26");
    await asOwner(() =>
      db.query(`update public.transactions set transaction_date = '2026-11-27' where recurring_schedule_id = $1 and scheduled_for = '2026-11-26'`, [id]),
    );
    // Simulate a retry that somehow re-attempts the same occurrence.
    await db.query(`update public.recurring_schedules set next_scheduled_date = '2026-11-26' where id = $1`, [id]);
    await processAsService("2026-11-26");
    expect(await txDates(id)).toEqual(["2026-11-19", "2026-11-27"]);
  });

  it("stops generating once disabled and preserves history (FR-TRANS-015)", async () => {
    const id = await createSchedule({ category: "Groceries", interval: "weekly", start: "2026-11-19", today: "2026-11-19" });
    await asOwner(() => db.query(`update public.recurring_schedules set is_active = false where id = $1`, [id]));
    await processAsService("2026-12-31");
    expect(await txDates(id)).toEqual(["2026-11-19"]);
  });

  it("applies schedule edits to future occurrences only (FR-TRANS-016)", async () => {
    const id = await createSchedule({ category: "Groceries", interval: "weekly", start: "2026-11-19", today: "2026-11-19", amount: "10.00" });
    await asOwner(() => db.query(`update public.recurring_schedules set amount = 12.50 where id = $1`, [id]));
    await processAsService("2026-11-26");
    const r = await db.query<{ amount: string }>(
      `select amount::text from public.transactions where recurring_schedule_id = $1 order by transaction_date`,
      [id],
    );
    expect(r.rows.map((x) => x.amount)).toEqual(["10.00", "12.50"]);
  });

  it("keeps generating for a category archived after the schedule was created", async () => {
    const id = await createSchedule({ category: "Travel", interval: "weekly", start: "2026-11-19", today: "2026-11-19" });
    await asOwner(() => db.query(`update public.categories set is_archived = true where name = 'Travel'`));
    await processAsService("2026-11-26");
    expect(await txDates(id)).toEqual(["2026-11-19", "2026-11-26"]);
  });

  it("records nothing for a subscription until its renewal date", async () => {
    const id = await createSchedule({
      category: "Subscriptions",
      interval: "monthly",
      start: "2026-12-05",
      today: "2026-11-19",
      recordFirst: false,
      subscription: true,
    });
    expect(await txDates(id)).toEqual([]);
    expect(await nextDate(id)).toBe("2026-12-05");
    await processAsService("2026-12-05");
    expect(await txDates(id)).toEqual(["2026-12-05"]);
  });

  it("logs each processing run", async () => {
    await processAsService("2026-11-19");
    const r = await db.query<{ n: number }>(`select count(*)::int as n from public.recurring_processing_runs where finished_at is not null`);
    expect(r.rows[0].n).toBe(1);
  });
});
