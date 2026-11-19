# Pocket Watch — Decisions & Deviations Log

Decisions made with the product owner on 2026-11-19 that refine or override the
PRD, TAD, Style Guide and Component Specs. Where this file conflicts with those
documents, this file wins.

## Visual source of truth

- `docs/references.png` is the primary visual reference.
- **Mobile is the primary design target** (overrides "desktop primary" in the
  Style Guide and PRD §11.2). Desktop still gets the sidebar layout.
- Minimum text size is 11px; essential content is 12px or larger.

## Product decisions

| Topic | Decision |
| --- | --- |
| Subscriptions location | A **Subscriptions tab on the Budget page** (Categories / Transactions / Subscriptions), as in the reference. |
| Subscriptions model | A subscription is a `recurring_schedules` row with `is_subscription = true` (expense only), plus an optional `icon`. The Add Subscription form's renewal date is the next charge; nothing is recorded until that date. |
| Billing cycles | Weekly and Monthly only (PRD FR-TRANS-012). |
| Transaction form | Date only — no time field. |
| Description length | 100 characters. |
| Home hero figure | Net Cash Flow for the selected month replaces "My Current Balance". |
| Notification bell | Lists transactions created automatically by recurring schedules since the bell was last opened (`transactions.source = 'recurring'`, `profiles.notifications_seen_at`). |
| Profile menu | Edit Profile, Security, Appearance, Regional, Categories, Data, Sign Out. No Privacy, Help & Support or Terms items; no email shown. |
| Savings | Not a default category. Savings is emphasised in Analytics (savings rate / savings chart). |
| Default categories | PRD §6.1 list. |
| Budget amounts | Zero is allowed. |
| Analytics content | PRD list (FR-AN-001…008) plus the reference's savings chart as an extra. |
| Session length | 7 days of inactivity before sign-out. |
| Password policy | Minimum 6 characters with upper-case, lower-case and a number (owner's choice; Supabase minimum). |
| Currencies | CAD (default), USD, EUR, GBP — display only, never converted. |
| Date format | MM/DD/YYYY default (DD/MM/YYYY and YYYY-MM-DD available in Profile). |
| Timezone | `America/Vancouver`. |

## Phase 3 notes (Analytics)

- **Filters** (period presets, month, year, custom range, category, type) live
  in the URL and drive every section. Net cash flow and savings rate show "—"
  when a type or category filter is on, because they compare income with
  expenses.
- **Expense breakdown** keeps the donut the PRD/Style Guide ask for, paired with
  a ranked list (icon, name, amount, %, bar) so categories are identified and
  compared without relying on colour. More than 6 categories fold into "Other".
  Known limitation: brand blue and purple are hard to tell apart for some
  colour-blind readers; the list carries identity.
- **Trends** draw Net cash flow as a dashed line in the primary text colour
  (mint was too close to income cyan).
- **Savings** ignores type/category filters (it needs both) and says so.
- **Subscriptions** in Analytics show subscription vs other expenses per month
  plus the active list with monthly equivalents; management stays on the Budget
  page.
- **Historical comparison** compares any two months or years (category filter
  applies). **Budget history** keeps monthly and yearly separate.
- Chart colours reference `--pw-*` tokens directly: Tailwind only emits
  `--color-*` variables that a class uses, so some were undefined at runtime.

## Phase 2 notes

- **Budget totals:** "Total Spent" and utilisation cover budgeted categories
  only, so utilisation compares like with like. Spending in unbudgeted
  categories is shown separately ("Plus $X spent in categories without a
  budget" and a "Without a budget" list) and still counts in all expense
  totals and analytics (FR-BUD-010).
- **Selected month** travels in the URL (`?month=YYYY-MM`) between Home,
  Budget and Transactions; yearly budgets use `?period=yearly&year=YYYY`.
- **Subscriptions** can be added from Budget → Subscriptions, or by switching
  "Subscription" on for any recurring expense (Profile → Recurring).

## Phase 1 scope

Also added: a **Profile → Recurring** screen listing every schedule with edit/stop, so a schedule stays reachable even after all its transactions are deleted.


PRD Phase 1, plus: design tokens, app layout (sidebar + bottom navigation),
core components, and a transaction history screen.

## Technical deviations from the TAD

- **Supabase key names.** Supabase now issues publishable/secret keys, so the
  env vars are `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`
  (TAD §12 used `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`).
- **Next.js 16** with Cache Components enabled (scaffold default).
- **Recurring generation runs in Postgres** (`public.process_recurring_schedules`,
  `private.generate_occurrences`) so inserting occurrences and advancing the
  schedule is atomic, with row locks. The cron route only calls it.
- **`transactions.scheduled_for`** records which occurrence a generated row
  fulfils; the unique key is `(recurring_schedule_id, scheduled_for)` rather
  than the transaction date, so editing a generated transaction's date can
  never cause a duplicate.
- **`transactions.source`** (`manual` | `recurring`) distinguishes rows the
  user entered from rows the scheduler created (drives the bell).
- **Composite foreign keys** `(category_id, type) → categories(id, category_type)`
  enforce that income/expense categories match their transactions and that only
  expense categories can be budgeted.
- **`categories.color`** stores a chart-palette key so category colours stay
  stable across Home, Analytics and Budget.
- **`recurring_processing_runs`** table logs each daily run for troubleshooting.
- **Session inactivity** is enforced by the app (Supabase's inactivity timeout
  is a paid-plan feature).
- **Tests:** schema and recurring logic are tested by running the real
  migrations in PGlite (embedded Postgres) — no Docker required.

## Design token adjustments (for WCAG 2.2 AA)

Small text must reach 4.5:1 contrast. These Style Guide values were adjusted:

| Token | Style Guide | Implemented |
| --- | --- | --- |
| Dark `text-muted` | #91B2B3 | #9DBDBE |
| Dark `financial-expense` / negative / exceeded | #FF8B7B | #FF9686 |
| Light `brand-primary` | #078E9C | #067A86 |
| Light `text-muted` | #718D8D | #557171 |
| Light `financial-income` | #168D72 | #12785F |
| Light `financial-expense` | #C75E50 | #B14E3E |
| Light `financial-warning` | #A87917 | #8A6210 |

Chart colours were run through the dataviz palette validator. Income (cyan) vs
expenses (yellow) passes CVD separation (ΔE ≈ 17), normal-vision separation and
3:1 contrast in both modes. Light-mode yellow was darkened to #A87D12 (was 2.6:1
on white). In dark mode the brand chart colours sit above the validator's
lightness band (calibrated for near-black surfaces); they are kept because the
Pocket Watch dark surface is mid-teal and in-band colours look muddy. Charts
always ship with a legend, tooltips and a table view.

Light-mode values the Style Guide did not specify (hover, active, overlay,
chart colours, etc.) were derived to keep the same identity.

## Brand assets

- 1024px masters live in `docs/` (Logo App Icon / Dark / Light).
- iPhone and PWA icons use a **full-bleed** version of the app icon (corners
  filled with its gradient #01BDC6 → #0B9095 → #186367) because iOS renders
  transparent corners black and applies its own rounding. The browser-tab
  favicon keeps the rounded artwork.
