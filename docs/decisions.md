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

Light-mode values the Style Guide did not specify (hover, active, overlay,
chart colours, etc.) were derived to keep the same identity.

## Brand assets

- 1024px masters live in `docs/` (Logo App Icon / Dark / Light).
- iPhone and PWA icons use a **full-bleed** version of the app icon (corners
  filled with its gradient #01BDC6 → #0B9095 → #186367) because iOS renders
  transparent corners black and applies its own rounding. The browser-tab
  favicon keeps the rounded artwork.
