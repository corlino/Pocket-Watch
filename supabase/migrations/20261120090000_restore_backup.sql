-- =============================================================================
-- Restore from a Pocket Watch JSON backup (PRD FR-PRO-008, §10.2; TAD §14.2).
--
-- Replaces ALL of the signed-in administrator's categories, recurring
-- schedules, transactions and budgets (and display name / preferences) with
-- the backup's contents in ONE transaction: if anything fails, nothing
-- changes. IDs are preserved so relationships survive. owner_id always comes
-- from the session (auth.uid()), never from the file.
--
-- The app validates the file (shape, types, references) before calling this;
-- constraints and foreign keys here are the final safety net.
-- =============================================================================

create function public.restore_backup(p_backup jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  d jsonb := p_backup -> 'data';
  n_categories integer;
  n_schedules integer;
  n_transactions integer;
  n_budgets integer;
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if p_backup ->> 'format' is distinct from 'pocket-watch-backup' or (p_backup ->> 'version')::int <> 1 then
    raise exception 'Unsupported backup format' using errcode = '22023', hint = 'unsupported_backup';
  end if;

  -- 1. Clear current data (children first).
  delete from public.transactions where owner_id = uid;
  delete from public.budgets where owner_id = uid;
  delete from public.recurring_schedules where owner_id = uid;
  delete from public.categories where owner_id = uid;

  -- 2. Categories — inserted unarchived so dependent rows pass the
  --    "no new records on archived categories" trigger; archived flags are
  --    re-applied at the end.
  insert into public.categories (id, owner_id, name, category_type, icon, color, is_archived, sort_order, created_at, updated_at)
  select c.id, uid, c.name, c.category_type, c.icon, coalesce(c.color, 'cyan'), false, coalesce(c.sort_order, 0),
         coalesce(c.created_at, now()), coalesce(c.updated_at, now())
  from jsonb_to_recordset(coalesce(d -> 'categories', '[]')) as c(
    id uuid, name text, category_type public.transaction_type, icon text, color text, is_archived boolean,
    sort_order integer, created_at timestamptz, updated_at timestamptz);
  get diagnostics n_categories = row_count;

  -- 3. Recurring schedules.
  insert into public.recurring_schedules (
    id, owner_id, transaction_type, category_id, amount, description, notes, recurrence_interval,
    original_start_date, next_scheduled_date, anchor_day_of_month, is_active, is_subscription, icon, created_at, updated_at)
  select s.id, uid, s.transaction_type, s.category_id, s.amount, s.description, s.notes, s.recurrence_interval,
         s.original_start_date, s.next_scheduled_date, s.anchor_day_of_month, coalesce(s.is_active, true),
         coalesce(s.is_subscription, false), s.icon, coalesce(s.created_at, now()), coalesce(s.updated_at, now())
  from jsonb_to_recordset(coalesce(d -> 'recurring_schedules', '[]')) as s(
    id uuid, transaction_type public.transaction_type, category_id uuid, amount numeric, description varchar,
    notes text, recurrence_interval public.recurrence_interval, original_start_date date, next_scheduled_date date,
    anchor_day_of_month smallint, is_active boolean, is_subscription boolean, icon text,
    created_at timestamptz, updated_at timestamptz);
  get diagnostics n_schedules = row_count;

  -- 4. Transactions.
  insert into public.transactions (
    id, owner_id, transaction_type, category_id, amount, description, notes, transaction_date,
    recurring_schedule_id, scheduled_for, source, created_at, updated_at)
  select t.id, uid, t.transaction_type, t.category_id, t.amount, t.description, t.notes, t.transaction_date,
         t.recurring_schedule_id, t.scheduled_for, coalesce(t.source, 'manual'),
         coalesce(t.created_at, now()), coalesce(t.updated_at, now())
  from jsonb_to_recordset(coalesce(d -> 'transactions', '[]')) as t(
    id uuid, transaction_type public.transaction_type, category_id uuid, amount numeric, description varchar,
    notes text, transaction_date date, recurring_schedule_id uuid, scheduled_for date,
    source public.transaction_source, created_at timestamptz, updated_at timestamptz);
  get diagnostics n_transactions = row_count;

  -- 5. Budgets.
  insert into public.budgets (id, owner_id, category_id, allocated_amount, period_type, period_identifier, created_at, updated_at)
  select b.id, uid, b.category_id, b.allocated_amount, b.period_type, b.period_identifier,
         coalesce(b.created_at, now()), coalesce(b.updated_at, now())
  from jsonb_to_recordset(coalesce(d -> 'budgets', '[]')) as b(
    id uuid, category_id uuid, allocated_amount numeric, period_type public.budget_period_type,
    period_identifier text, created_at timestamptz, updated_at timestamptz);
  get diagnostics n_budgets = row_count;

  -- 6. Re-apply archived flags.
  update public.categories c set is_archived = true
  from jsonb_to_recordset(coalesce(d -> 'categories', '[]')) as x(id uuid, is_archived boolean)
  where c.id = x.id and c.owner_id = uid and x.is_archived;

  -- 7. Profile and preferences (only fields present in the backup).
  if d -> 'profile' ->> 'display_name' is not null then
    update public.profiles set display_name = d -> 'profile' ->> 'display_name' where id = uid;
  end if;
  if jsonb_typeof(d -> 'preferences') = 'object' then
    update public.preferences set
      currency_display = coalesce(d -> 'preferences' ->> 'currency_display', currency_display),
      date_format = coalesce(d -> 'preferences' ->> 'date_format', date_format),
      number_format = coalesce(d -> 'preferences' ->> 'number_format', number_format),
      appearance = coalesce((d -> 'preferences' ->> 'appearance')::public.appearance, appearance)
    where owner_id = uid;
  end if;

  return jsonb_build_object(
    'categories', n_categories,
    'recurring_schedules', n_schedules,
    'transactions', n_transactions,
    'budgets', n_budgets
  );
end;
$$;

revoke all on function public.restore_backup(jsonb) from public, anon;
grant execute on function public.restore_backup(jsonb) to authenticated;
