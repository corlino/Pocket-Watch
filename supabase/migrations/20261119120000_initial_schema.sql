-- =============================================================================
-- Pocket Watch — initial schema
-- Source of truth: docs/prd.md §7, docs/technicalarchitecture.md §4, §5.2, §7.
--
-- Design notes
-- * Single administrator. Every row carries owner_id (defaults to auth.uid())
--   and Row Level Security restricts all access to that owner.
-- * Money is NUMERIC(12,2); amounts are always positive. transaction_type
--   decides whether a row is income or expense.
-- * Composite foreign keys (category_id, <type>) → categories(id, category_type)
--   make it impossible to put an income category on an expense transaction or
--   to budget an income category.
-- * Recurring generation happens in the database (private.generate_occurrences)
--   so inserting occurrences and advancing the schedule is one atomic step,
--   with row locks and a unique (schedule, scheduled_for) constraint as a
--   second line of defence against duplicates.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.transaction_type as enum ('income', 'expense');
create type public.budget_period_type as enum ('monthly', 'yearly');
create type public.recurrence_interval as enum ('weekly', 'monthly');
create type public.transaction_source as enum ('manual', 'recurring');
create type public.appearance as enum ('dark', 'light', 'system');

-- -----------------------------------------------------------------------------
-- Shared trigger: updated_at
-- -----------------------------------------------------------------------------
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Colin'
    check (char_length(btrim(display_name)) between 1 and 50),
  -- Bell: recurring transactions created after this moment count as unread.
  notifications_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- preferences
-- -----------------------------------------------------------------------------
create table public.preferences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  currency_display text not null default 'CAD'
    check (currency_display in ('CAD', 'USD', 'EUR', 'GBP')),
  date_format text not null default 'MM/DD/YYYY'
    check (date_format in ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),
  number_format text not null default 'comma-dot'
    check (number_format in ('comma-dot', 'space-comma', 'dot-comma')),
  appearance public.appearance not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger preferences_set_updated_at
  before update on public.preferences
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  category_type public.transaction_type not null,
  icon text check (icon is null or icon ~ '^[a-z0-9-]{1,40}$'),
  color text not null default 'cyan'
    check (color in ('cyan', 'yellow', 'mint', 'coral', 'purple', 'blue', 'muted')),
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Target for composite foreign keys that enforce matching types.
  unique (id, category_type)
);

-- FR-CAT-005/006: unique name within a type (case-insensitive, trimmed).
create unique index categories_owner_type_name_key
  on public.categories (owner_id, category_type, lower(btrim(name)));

create index categories_owner_type_idx on public.categories (owner_id, category_type, is_archived);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- recurring_schedules
-- -----------------------------------------------------------------------------
create table public.recurring_schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  transaction_type public.transaction_type not null,
  category_id uuid not null,
  amount numeric(12, 2) not null check (amount > 0),
  description varchar(100),
  notes text check (notes is null or char_length(notes) <= 1000),
  recurrence_interval public.recurrence_interval not null,
  original_start_date date not null,
  next_scheduled_date date not null,
  -- Preserved intended day for monthly schedules (FR-TRANS-019).
  anchor_day_of_month smallint check (anchor_day_of_month between 1 and 31),
  is_active boolean not null default true,
  -- Subscriptions are recurring expenses the user marks as such (Budget → Subscriptions).
  is_subscription boolean not null default false,
  icon text check (icon is null or icon ~ '^[a-z0-9-]{1,40}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  foreign key (category_id, transaction_type)
    references public.categories (id, category_type) on delete restrict,
  check (next_scheduled_date >= original_start_date),
  check (
    (recurrence_interval = 'monthly' and anchor_day_of_month is not null)
    or (recurrence_interval = 'weekly' and anchor_day_of_month is null)
  ),
  check (not is_subscription or transaction_type = 'expense')
);

create index recurring_schedules_due_idx
  on public.recurring_schedules (next_scheduled_date) where is_active;
create index recurring_schedules_owner_idx on public.recurring_schedules (owner_id);
create index recurring_schedules_category_idx on public.recurring_schedules (category_id);

create trigger recurring_schedules_set_updated_at
  before update on public.recurring_schedules
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- transactions
-- -----------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  transaction_type public.transaction_type not null,
  category_id uuid not null,
  amount numeric(12, 2) not null check (amount > 0),
  description varchar(100),
  notes text check (notes is null or char_length(notes) <= 1000),
  transaction_date date not null,
  recurring_schedule_id uuid references public.recurring_schedules (id) on delete set null,
  -- The occurrence this row fulfils. Kept separate from transaction_date so a
  -- user editing the date of a generated transaction never re-opens the slot.
  scheduled_for date,
  source public.transaction_source not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  foreign key (category_id, transaction_type)
    references public.categories (id, category_type) on delete restrict,
  -- FR-TRANS-014 / TAD §7.4: one transaction per schedule occurrence.
  -- (NULLs are distinct, so ordinary transactions are unaffected.)
  unique (recurring_schedule_id, scheduled_for),
  check (source = 'manual' or recurring_schedule_id is not null or scheduled_for is not null)
);

create index transactions_owner_date_idx
  on public.transactions (owner_id, transaction_date desc, created_at desc);
create index transactions_category_date_idx on public.transactions (category_id, transaction_date);
create index transactions_schedule_idx on public.transactions (recurring_schedule_id);
create index transactions_recurring_created_idx
  on public.transactions (owner_id, created_at desc) where source = 'recurring';

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- budgets (managed in Phase 2; schema established now)
-- -----------------------------------------------------------------------------
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid not null,
  -- Only expense categories can be budgeted (enforced via the composite FK).
  category_type public.transaction_type not null default 'expense'
    check (category_type = 'expense'),
  allocated_amount numeric(12, 2) not null check (allocated_amount >= 0),
  period_type public.budget_period_type not null,
  period_identifier text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  foreign key (category_id, category_type)
    references public.categories (id, category_type) on delete cascade,
  unique (category_id, period_type, period_identifier),
  check (
    (period_type = 'monthly' and period_identifier ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
    or (period_type = 'yearly' and period_identifier ~ '^[0-9]{4}$')
  )
);

create index budgets_owner_period_idx on public.budgets (owner_id, period_type, period_identifier);

create trigger budgets_set_updated_at
  before update on public.budgets
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- recurring_processing_runs — troubleshooting log for the daily job
-- -----------------------------------------------------------------------------
create table public.recurring_processing_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  schedules_processed integer not null default 0,
  transactions_created integer not null default 0,
  error text
);

create index recurring_processing_runs_started_idx
  on public.recurring_processing_runs (started_at desc);

-- -----------------------------------------------------------------------------
-- Archived categories cannot receive new manual transactions, new schedules,
-- or new budgets (FR-CAT-009, FR-BUD-003). Existing rows are unaffected, and
-- active schedules keep generating so recurring history stays complete.
-- -----------------------------------------------------------------------------
create function private.reject_archived_category()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  archived boolean;
begin
  -- Nested (plpgsql does not short-circuit): only transactions has "source".
  if tg_table_name = 'transactions' then
    if new.source = 'recurring' then
      return new;
    end if;
  end if;

  if tg_op = 'UPDATE' and new.category_id is not distinct from old.category_id then
    return new;
  end if;

  select c.is_archived into archived from public.categories c where c.id = new.category_id;
  if archived then
    raise exception 'Category is archived and cannot be used for new records'
      using errcode = 'P0001', hint = 'category_archived';
  end if;
  return new;
end;
$$;

create trigger transactions_reject_archived_category
  before insert or update of category_id on public.transactions
  for each row execute function private.reject_archived_category();

create trigger recurring_schedules_reject_archived_category
  before insert or update of category_id on public.recurring_schedules
  for each row execute function private.reject_archived_category();

create trigger budgets_reject_archived_category
  before insert or update of category_id on public.budgets
  for each row execute function private.reject_archived_category();

-- -----------------------------------------------------------------------------
-- Recurrence date maths (mirrors lib/dates/recurrence.ts; both are tested)
-- -----------------------------------------------------------------------------
create function private.next_occurrence(
  p_interval public.recurrence_interval,
  p_anchor_day smallint,
  p_from date
)
returns date
language plpgsql
immutable
set search_path = ''
as $$
declare
  first_of_next date;
  last_day integer;
begin
  if p_interval = 'weekly' then
    return p_from + 7;
  end if;

  -- Monthly: the anchor day in the following calendar month, clamped to that
  -- month's last day. Always derived from the anchor, never from p_from's day,
  -- so Jan 31 → Feb 28 → Mar 31.
  first_of_next := (date_trunc('month', p_from) + interval '1 month')::date;
  last_day := extract(day from (first_of_next + interval '1 month' - interval '1 day'))::integer;
  return first_of_next + (least(p_anchor_day, last_day) - 1);
end;
$$;

-- Generate every due occurrence for one schedule up to and including p_today,
-- then advance the schedule. Caller must hold a lock on the schedule row.
create function private.generate_occurrences(p_schedule_id uuid, p_today date)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.recurring_schedules;
  d date;
  created integer := 0;
  inserted integer;
begin
  select * into s from public.recurring_schedules where id = p_schedule_id for update;
  if not found or not s.is_active then
    return 0;
  end if;

  d := s.next_scheduled_date;
  while d <= p_today loop
    insert into public.transactions (
      owner_id, transaction_type, category_id, amount, description, notes,
      transaction_date, recurring_schedule_id, scheduled_for, source
    ) values (
      s.owner_id, s.transaction_type, s.category_id, s.amount, s.description, s.notes,
      d, s.id, d, 'recurring'
    )
    on conflict (recurring_schedule_id, scheduled_for) do nothing;

    get diagnostics inserted = row_count;
    created := created + inserted;
    d := private.next_occurrence(s.recurrence_interval, s.anchor_day_of_month, d);
  end loop;

  if d <> s.next_scheduled_date then
    update public.recurring_schedules set next_scheduled_date = d where id = s.id;
  end if;

  return created;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: daily job (service role only). p_today is the date in APP_TIME_ZONE.
-- -----------------------------------------------------------------------------
create function public.process_recurring_schedules(p_today date)
returns table (schedules_processed integer, transactions_created integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  run_id uuid;
  sid uuid;
  n_schedules integer := 0;
  n_created integer := 0;
begin
  insert into public.recurring_processing_runs (run_date) values (p_today) returning id into run_id;

  for sid in
    select id from public.recurring_schedules
    where is_active and next_scheduled_date <= p_today
    order by next_scheduled_date
    for update skip locked
  loop
    n_created := n_created + private.generate_occurrences(sid, p_today);
    n_schedules := n_schedules + 1;
  end loop;

  update public.recurring_processing_runs
    set finished_at = now(), schedules_processed = n_schedules, transactions_created = n_created
    where id = run_id;

  schedules_processed := n_schedules;
  transactions_created := n_created;
  return next;
end;
$$;

revoke all on function public.process_recurring_schedules(date) from public, anon, authenticated;
grant execute on function public.process_recurring_schedules(date) to service_role;

-- -----------------------------------------------------------------------------
-- RPC: create a recurring schedule (and optionally its first transaction)
-- atomically. Runs as the caller, so RLS and owner defaults apply.
--
--   p_record_first = true  → Add Transaction with "recurring" on: the first
--     transaction is saved immediately at p_start_date (FR-TRANS-013) and the
--     schedule continues from the next occurrence.
--   p_record_first = false → Add Subscription: p_start_date is the next
--     renewal; nothing is recorded until that date arrives.
--
-- Any occurrences already due (back-dated start) are generated straight away.
-- -----------------------------------------------------------------------------
create function public.create_recurring_schedule(
  p_transaction_type public.transaction_type,
  p_category_id uuid,
  p_amount numeric,
  p_description text,
  p_notes text,
  p_interval public.recurrence_interval,
  p_start_date date,
  p_today date,
  p_record_first boolean default true,
  p_is_subscription boolean default false,
  p_icon text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  anchor smallint;
  sched_id uuid;
  next_date date;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  anchor := case when p_interval = 'monthly' then extract(day from p_start_date)::smallint end;
  next_date := case
    when p_record_first then private.next_occurrence(p_interval, anchor, p_start_date)
    else p_start_date
  end;

  insert into public.recurring_schedules (
    transaction_type, category_id, amount, description, notes,
    recurrence_interval, original_start_date, next_scheduled_date,
    anchor_day_of_month, is_subscription, icon
  ) values (
    p_transaction_type, p_category_id, p_amount, nullif(btrim(p_description), ''), nullif(btrim(p_notes), ''),
    p_interval, p_start_date, next_date,
    anchor, p_is_subscription, p_icon
  )
  returning id into sched_id;

  if p_record_first then
    insert into public.transactions (
      transaction_type, category_id, amount, description, notes,
      transaction_date, recurring_schedule_id, scheduled_for, source
    ) values (
      p_transaction_type, p_category_id, p_amount, nullif(btrim(p_description), ''), nullif(btrim(p_notes), ''),
      p_start_date, sched_id, p_start_date, 'manual'
    );
  end if;

  perform private.generate_occurrences(sched_id, p_today);
  return sched_id;
end;
$$;

revoke all on function public.create_recurring_schedule(
  public.transaction_type, uuid, numeric, text, text, public.recurrence_interval, date, date, boolean, boolean, text
) from public, anon;
grant execute on function public.create_recurring_schedule(
  public.transaction_type, uuid, numeric, text, text, public.recurrence_interval, date, date, boolean, boolean, text
) to authenticated;

-- private.generate_occurrences is reachable only through the functions above.
revoke all on function private.generate_occurrences(uuid, date) from public, anon, authenticated;
revoke all on function private.next_occurrence(public.recurrence_interval, smallint, date) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.next_occurrence(public.recurrence_interval, smallint, date) to authenticated;
grant execute on function private.generate_occurrences(uuid, date) to authenticated;

-- -----------------------------------------------------------------------------
-- New administrator bootstrap: profile, preferences and default categories
-- (PRD §6.1). Runs once, when the provisioning script creates the auth user.
-- -----------------------------------------------------------------------------
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.preferences (owner_id) values (new.id);

  insert into public.categories (owner_id, name, category_type, icon, color, sort_order) values
    (new.id, 'Housing',              'expense', 'house',            'cyan',   1),
    (new.id, 'Groceries',            'expense', 'shopping-basket',  'mint',   2),
    (new.id, 'Transportation',       'expense', 'car-front',        'purple', 3),
    (new.id, 'Dining & Restaurants', 'expense', 'utensils',         'yellow', 4),
    (new.id, 'Entertainment',        'expense', 'ticket',           'coral',  5),
    (new.id, 'Shopping',             'expense', 'shopping-bag',     'blue',   6),
    (new.id, 'Utilities',            'expense', 'zap',              'yellow', 7),
    (new.id, 'Healthcare',           'expense', 'heart-pulse',      'coral',  8),
    (new.id, 'Personal Care',        'expense', 'sparkles',         'purple', 9),
    (new.id, 'Subscriptions',        'expense', 'repeat',           'cyan',   10),
    (new.id, 'Travel',               'expense', 'plane',            'blue',   11),
    (new.id, 'Education',            'expense', 'graduation-cap',   'mint',   12),
    (new.id, 'Other Expenses',       'expense', 'circle-ellipsis',  'muted',  13),
    (new.id, 'Salary',               'income',  'briefcase',        'mint',   1),
    (new.id, 'Freelance',            'income',  'laptop',           'cyan',   2),
    (new.id, 'Investments',          'income',  'chart-line',       'blue',   3),
    (new.id, 'Gifts',                'income',  'gift',             'purple', 4),
    (new.id, 'Bonuses',              'income',  'badge-dollar-sign','yellow', 5),
    (new.id, 'Other Income',         'income',  'circle-plus',      'muted',  6);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security — owner-only access on every table (TAD §5.2)
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.categories enable row level security;
alter table public.recurring_schedules enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_processing_runs enable row level security;

create policy "Owner can read profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Owner can update profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Owner can read preferences" on public.preferences
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owner can update preferences" on public.preferences
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

do $$
declare
  t text;
begin
  foreach t in array array['categories', 'recurring_schedules', 'transactions', 'budgets'] loop
    execute format(
      'create policy "Owner can read %1$s" on public.%1$I for select to authenticated using (owner_id = (select auth.uid()))', t);
    execute format(
      'create policy "Owner can insert %1$s" on public.%1$I for insert to authenticated with check (owner_id = (select auth.uid()))', t);
    execute format(
      'create policy "Owner can update %1$s" on public.%1$I for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t);
    execute format(
      'create policy "Owner can delete %1$s" on public.%1$I for delete to authenticated using (owner_id = (select auth.uid()))', t);
  end loop;
end;
$$;

-- Processing log is written by the service role only; the admin may read it.
create policy "Authenticated can read processing runs" on public.recurring_processing_runs
  for select to authenticated using (true);

-- Never expose anything to anonymous visitors.
revoke all on all tables in schema public from anon;
