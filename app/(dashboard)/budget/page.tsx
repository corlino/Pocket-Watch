import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LinkTabs } from "@/components/ui/link-tabs";
import { PeriodNavigator } from "@/components/shared/period-navigator";
import { KpiSkeleton } from "@/components/financial/kpi-card";
import { BudgetProgressBar } from "@/components/financial/budget-progress";
import { BudgetCategoryCard } from "@/components/financial/budget-category-card";
import { CategoryIcon } from "@/components/categories/category-icon";
import { BudgetCategoriesPanel } from "@/components/budgets/budget-categories-panel";
import { CategoryTransactionGroups } from "@/components/budgets/category-transaction-groups";
import { SubscriptionsPanel } from "@/components/budgets/subscriptions-panel";
import { TransactionListSkeleton } from "@/components/transactions/transaction-list";
import { getBudgetOverview, listSubscriptions, periodIdentifier, periodRange, type BudgetPeriod } from "@/features/budgets/queries";
import { getDisplayPrefs, listCategories, listTransactions } from "@/features/transactions/queries";
import { isMonthKey, monthKey, monthRange, parts, shiftMonth } from "@/lib/dates/date-only";
import { appToday } from "@/lib/dates/today";
import { formatMonthYear } from "@/lib/formatting";
import { formatMoney, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import { figureSizeLg } from "@/components/financial/fit-text";

export const metadata: Metadata = { title: "Budget" };

type Search = PageProps<"/budget">["searchParams"];
type Tab = "categories" | "transactions" | "subscriptions";

async function resolve(searchParams: Search) {
  const [params, today] = await Promise.all([searchParams, appToday()]);
  const get = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const currentMonth = monthKey(today);
  const currentYear = parts(today).year;
  const yearly = get("period") === "yearly";
  const yearParam = Number(get("year"));
  const monthParam = get("month");
  const period: BudgetPeriod = yearly
    ? { type: "yearly", year: Number.isInteger(yearParam) && yearParam > 1900 && yearParam < 2200 ? yearParam : currentYear }
    : { type: "monthly", month: monthParam && isMonthKey(monthParam) ? monthParam : currentMonth };
  const tabParam = get("tab");
  const tab: Tab = tabParam === "transactions" || tabParam === "subscriptions" ? tabParam : "categories";
  const category = get("category");
  return { period, tab, today, currentMonth, currentYear, category };
}

function hrefFor(period: BudgetPeriod, tab: Tab, extra = "") {
  const q = new URLSearchParams();
  if (period.type === "yearly") {
    q.set("period", "yearly");
    q.set("year", String(period.year));
  } else q.set("month", period.month);
  if (tab !== "categories") q.set("tab", tab);
  return `/budget?${q}${extra}`;
}

function periodLabel(p: BudgetPeriod) {
  return p.type === "monthly" ? formatMonthYear(monthRange(p.month).start) : String(p.year);
}

/** Budget — Budget Management (PRD §4.3, style guide §9.3, component spec §7.3–7.5). */
export default function BudgetPage({ searchParams }: PageProps<"/budget">) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="My Budget" />
      <Suspense fallback={<div className="h-[100px]" />}>
        <Controls searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<KpiSkeleton />}>
        <Summary searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<TransactionListSkeleton rows={4} />}>
        <TabContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Controls({ searchParams }: { searchParams: Search }) {
  const { period, tab, currentMonth, currentYear } = await resolve(searchParams);
  const monthly = period.type === "monthly";
  const prev: BudgetPeriod = monthly ? { type: "monthly", month: shiftMonth(period.month, -1) } : { type: "yearly", year: period.year - 1 };
  const next: BudgetPeriod = monthly ? { type: "monthly", month: shiftMonth(period.month, 1) } : { type: "yearly", year: period.year + 1 };
  const current: BudgetPeriod = monthly ? { type: "monthly", month: currentMonth } : { type: "yearly", year: currentYear };
  const isCurrent = monthly ? period.month === currentMonth : period.year === currentYear;

  return (
    <div className="flex flex-col gap-3">
      <LinkTabs
        label="Budget period type"
        className="mx-auto w-full max-w-sm"
        items={[
          { href: hrefFor({ type: "monthly", month: monthly ? period.month : currentMonth }, tab), label: "Monthly", active: monthly },
          { href: hrefFor({ type: "yearly", year: monthly ? parts(monthRange(period.month).start).year : period.year }, tab), label: "Yearly", active: !monthly },
        ]}
      />
      <PeriodNavigator
        label={periodLabel(period)}
        prevHref={hrefFor(prev, tab)}
        nextHref={hrefFor(next, tab)}
        prevLabel={`Previous ${monthly ? "month" : "year"}, ${periodLabel(prev)}`}
        nextLabel={`Next ${monthly ? "month" : "year"}, ${periodLabel(next)}`}
        currentHref={hrefFor(current, tab)}
        currentLabel={monthly ? "Back to current month" : "Back to current year"}
        isCurrent={isCurrent}
      />
    </div>
  );
}

/** F-12 Budget Summary: total budget, spent, remaining, utilisation. */
async function Summary({ searchParams }: { searchParams: Search }) {
  const { period } = await resolve(searchParams);
  const [overview, prefs] = await Promise.all([getBudgetOverview(period), getDisplayPrefs()]);
  const t = overview.totals;
  const fmt = (v: Parameters<typeof formatMoney>[0]) => formatMoney(v, { currency: prefs.currency, numberFormat: prefs.numberFormat });
  const hasBudget = overview.lines.length > 0;

  return (
    <section aria-label="Budget summary" className="rounded-xl border border-border bg-surface-secondary p-4 shadow-card md:p-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4 [&>div]:min-w-0">
        <div>
          <dt className="text-caption text-fg-muted">Total Budget</dt>
          <dd className={cn("money font-semibold text-fg", figureSizeLg(fmt(t.allocated)))}>{fmt(t.allocated)}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-muted">Total Spent</dt>
          <dd className={cn("money font-semibold text-chart-yellow light:text-fg", figureSizeLg(fmt(t.spent)))}>{fmt(t.spent)}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-muted">{t.remaining.isNegative() ? "Over Budget" : "Remaining"}</dt>
          <dd className={cn("money font-semibold", figureSizeLg(fmt(t.remaining)), t.remaining.isNegative() ? "text-exceeded" : "text-fg")}>{fmt(t.remaining)}</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-muted">Utilization</dt>
          <dd className={cn("money font-semibold text-fg", figureSizeLg(hasBudget ? formatPercent(t.utilization, prefs.numberFormat) : "—"))}>
            {hasBudget ? formatPercent(t.utilization, prefs.numberFormat) : "—"}
            {hasBudget && t.utilization == null && <span className="sr-only">Unavailable</span>}
          </dd>
        </div>
      </dl>
      {hasBudget && (
        <div className="mt-4">
          <BudgetProgressBar percent={t.utilization?.toNumber() ?? null} status={t.status} label="Overall budget used" />
        </div>
      )}
      {overview.unbudgetedTotal.gt(0) && (
        <p className="mt-3 text-caption text-fg-secondary">
          Plus <span className="money font-semibold text-fg">{fmt(overview.unbudgetedTotal)}</span> spent in categories without a budget.
        </p>
      )}
    </section>
  );
}

async function TabContent({ searchParams }: { searchParams: Search }) {
  const r = await resolve(searchParams);
  const { period, tab } = r;

  return (
    <div className="flex flex-col gap-4">
      <LinkTabs
        label="Budget sections"
        items={[
          { href: hrefFor(period, "categories"), label: "Categories", active: tab === "categories" },
          { href: hrefFor(period, "transactions"), label: "Transactions", active: tab === "transactions" },
          { href: hrefFor(period, "subscriptions"), label: "Subscriptions", active: tab === "subscriptions" },
        ]}
      />
      {tab === "categories" && <CategoriesTab {...r} />}
      {tab === "transactions" && <TransactionsTab {...r} />}
      {tab === "subscriptions" && <SubscriptionsTab today={r.today} />}
    </div>
  );
}

async function CategoriesTab({ period }: Awaited<ReturnType<typeof resolve>>) {
  const [overview, categories, prefs] = await Promise.all([getBudgetOverview(period), listCategories(), getDisplayPrefs()]);
  const budgeted = new Set(overview.lines.map((l) => l.category.id));
  const available = categories.filter((c) => c.category_type === "expense" && !c.is_archived && !budgeted.has(c.id));
  const fmt = (v: Parameters<typeof formatMoney>[0]) => formatMoney(v, { currency: prefs.currency, numberFormat: prefs.numberFormat });

  return (
    <>
      <BudgetCategoriesPanel
        cards={overview.lines.map((line) => ({
          id: line.id,
          amount: line.allocated,
          category: line.category,
          card: <BudgetCategoryCard line={line} prefs={prefs} />,
        }))}
        availableCategories={available}
        periodType={period.type}
        periodIdentifier={periodIdentifier(period)}
        periodLabel={periodLabel(period)}
        prefs={prefs}
        transactionsHrefBase={hrefFor(period, "transactions")}
      />
      {overview.unbudgeted.length > 0 && (
        <section aria-labelledby="unbudgeted-heading">
          <h2 id="unbudgeted-heading" className="mb-1 px-1 text-caption font-semibold tracking-wide text-fg-secondary uppercase">
            Without a budget
          </h2>
          <p className="mb-2 px-1 text-caption text-fg-muted">Still counted in your expenses and analytics.</p>
          <ul className="flex flex-col gap-2">
            {overview.unbudgeted.map((u) => (
              <li key={u.category.id} className="flex min-h-14 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                <CategoryIcon icon={u.category.icon} color={u.category.color} size="sm" />
                <span className="flex-1 truncate text-body text-fg">{u.category.name}</span>
                <span className="money text-body font-semibold text-fg">{fmt(u.spent)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

async function TransactionsTab({ period, category }: Awaited<ReturnType<typeof resolve>>) {
  const { start, end } = periodRange(period);
  const [{ rows }, prefs, today] = await Promise.all([
    listTransactions({ type: "expense", from: start, to: end }, { limit: 1000 }),
    getDisplayPrefs(),
    appToday(),
  ]);
  return <CategoryTransactionGroups transactions={rows} prefs={prefs} today={today} openCategoryId={category} />;
}

async function SubscriptionsTab({ today }: { today: Awaited<ReturnType<typeof appToday>> }) {
  const [subscriptions, categories, prefs] = await Promise.all([listSubscriptions(), listCategories(), getDisplayPrefs()]);
  return <SubscriptionsPanel subscriptions={subscriptions} categories={categories} prefs={prefs} today={today} />;
}
