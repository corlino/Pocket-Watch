import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, ReceiptText, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { SectionHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PeriodNavigator } from "@/components/shared/period-navigator";
import { KpiCard, KpiSkeleton } from "@/components/financial/kpi-card";
import { BudgetCategoryCard } from "@/components/financial/budget-category-card";
import { BudgetCarousel } from "@/components/financial/budget-carousel";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { RecentActivity } from "@/components/transactions/recent-activity";
import { TransactionListSkeleton } from "@/components/transactions/transaction-list";
import { getDisplayPrefs, listTransactions } from "@/features/transactions/queries";
import { getBudgetOverview, transactionsInRange } from "@/features/budgets/queries";
import { monthlySeries, summarize } from "@/lib/calculations";
import { isMonthKey, monthKey, monthRange, shiftMonth, type MonthKey } from "@/lib/dates/date-only";
import { appToday } from "@/lib/dates/today";
import { formatMonthShort, formatMonthYear } from "@/lib/formatting";
import { formatMoney, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Home" };

type Search = PageProps<"/home">["searchParams"];

async function resolveMonth(searchParams: Search): Promise<{ month: MonthKey; current: MonthKey }> {
  const [params, today] = await Promise.all([searchParams, appToday()]);
  const current = monthKey(today);
  const m = typeof params.month === "string" && isMonthKey(params.month) ? params.month : current;
  return { month: m, current };
}

/** Home — Financial Overview (PRD §4.1, style guide §9.1). */
export default function HomePage({ searchParams }: PageProps<"/home">) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <Suspense fallback={<div className="h-11" />}>
        <Header searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<KpiSkeleton count={3} />}>
        <Summary searchParams={searchParams} />
      </Suspense>
      <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-surface" />}>
          <Budgets searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-surface" />}>
          <CashFlow searchParams={searchParams} />
        </Suspense>
      </div>
      <Suspense fallback={<TransactionListSkeleton rows={5} />}>
        <Recent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Header({ searchParams }: { searchParams: Search }) {
  const { month, current } = await resolveMonth(searchParams);
  const href = (m: MonthKey) => (m === current ? "/home" : `/home?month=${m}`);
  return (
    <PeriodNavigator
      label={formatMonthYear(monthRange(month).start)}
      prevHref={href(shiftMonth(month, -1))}
      nextHref={href(shiftMonth(month, 1))}
      prevLabel={`Previous month, ${formatMonthYear(monthRange(shiftMonth(month, -1)).start)}`}
      nextLabel={`Next month, ${formatMonthYear(monthRange(shiftMonth(month, 1)).start)}`}
      currentHref="/home"
      isCurrent={month === current}
    />
  );
}

async function Summary({ searchParams }: { searchParams: Search }) {
  const { month } = await resolveMonth(searchParams);
  const { start, end } = monthRange(month);
  const [transactions, prefs] = await Promise.all([transactionsInRange(start, end), getDisplayPrefs()]);
  const s = summarize(transactions, start, end);
  const fmt = (v: Parameters<typeof formatMoney>[0]) => formatMoney(v, { currency: prefs.currency, numberFormat: prefs.numberFormat });
  const negative = s.netCashFlow.isNegative();

  return (
    <section aria-labelledby="summary-heading" className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end">
      {/* F-01 hero: Net Cash Flow replaces "Current Balance" (docs/decisions.md). */}
      <div>
        <h1 id="summary-heading" className="text-h4 font-semibold text-fg">
          Net Cash Flow
        </h1>
        <p className={cn("money mt-1 text-[32px] leading-tight font-medium md:text-display", negative ? "text-negative" : "text-fg")}>
          {fmt(s.netCashFlow)}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-caption text-fg-muted">
          Savings rate
          <span
            className={cn(
              "money rounded-full px-2 py-0.5 font-semibold",
              s.savingsRate == null ? "bg-surface text-fg-muted" : s.savingsRate.isNegative() ? "bg-negative/15 text-negative" : "bg-positive/15 text-positive",
            )}
          >
            {s.savingsRate == null ? "Unavailable" : formatPercent(s.savingsRate, prefs.numberFormat)}
          </span>
          {s.savingsRate == null && <span>— no income this month</span>}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Income" value={fmt(s.income)} tone="income" icon={TrendingUp} />
        <KpiCard label="Expenses" value={fmt(s.expenses)} tone="expense" icon={TrendingDown} />
      </div>
    </section>
  );
}

async function Budgets({ searchParams }: { searchParams: Search }) {
  const { month, current } = await resolveMonth(searchParams);
  const [overview, prefs] = await Promise.all([getBudgetOverview({ type: "monthly", month }), getDisplayPrefs()]);
  const budgetHref = month === current ? "/budget" : `/budget?month=${month}`;

  return (
    <section aria-labelledby="budget-categories" className="min-w-0">
      <SectionHeader
        id="budget-categories"
        title="Budget Categories"
        action={
          <Link href={budgetHref} className="inline-flex min-h-11 items-center gap-1 text-caption font-medium text-brand hover:underline">
            View All <ChevronRight className="size-4" aria-hidden />
          </Link>
        }
      />
      {overview.lines.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            icon={Wallet}
            title="No budget for this month"
            description="Set category limits to see how your spending is tracking."
            action={
              <Button asChild variant="secondary">
                <Link href={budgetHref}>Create a budget</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <BudgetCarousel
          seeAllHref={budgetHref}
          cards={overview.lines.map((line) => ({
            id: line.id,
            name: line.category.name,
            node: <BudgetCategoryCard line={line} prefs={prefs} />,
          }))}
        />
      )}
    </section>
  );
}

async function CashFlow({ searchParams }: { searchParams: Search }) {
  const { month } = await resolveMonth(searchParams);
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5));
  const [transactions, prefs] = await Promise.all([
    transactionsInRange(monthRange(months[0]).start, monthRange(month).end),
    getDisplayPrefs(),
  ]);
  const series = monthlySeries(transactions, months).map((p) => ({
    month: p.month,
    label: formatMonthShort(p.month),
    longLabel: formatMonthYear(monthRange(p.month as MonthKey).start),
    income: p.income.toFixed(2),
    expenses: p.expenses.toFixed(2),
  }));
  return (
    <section aria-labelledby="cash-flow" className="min-w-0">
      <SectionHeader
        id="cash-flow"
        title="Cash Flow Insights"
        action={
          <Link href="/analytics" className="inline-flex min-h-11 items-center gap-1 text-caption font-medium text-brand hover:underline">
            View More <ChevronRight className="size-4" aria-hidden />
          </Link>
        }
      />
      <div className="rounded-lg border border-border bg-surface p-4">
        <CashFlowChart data={series} currency={prefs.currency} numberFormat={prefs.numberFormat} selectedMonth={month} />
      </div>
    </section>
  );
}

async function Recent({ searchParams }: { searchParams: Search }) {
  const { month, current } = await resolveMonth(searchParams);
  const [{ rows }, prefs, today] = await Promise.all([listTransactions({ month }, { limit: 30 }), getDisplayPrefs(), appToday()]);
  const allHref = `/transactions?month=${month}`;
  return (
    <section aria-labelledby="recent-activity">
      <SectionHeader
        id="recent-activity"
        title={month === current ? "Recent Activity" : `Activity in ${formatMonthYear(monthRange(month).start)}`}
        action={
          <Link href={allHref} className="inline-flex min-h-11 items-center gap-1 text-caption font-medium text-brand hover:underline">
            View All <ChevronRight className="size-4" aria-hidden />
          </Link>
        }
      />
      {rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            icon={ReceiptText}
            title="Nothing here yet"
            description={month === current ? "Add your first transaction to start tracking your finances." : "No transactions were recorded this month."}
            action={month === current ? <AddTransactionButton /> : undefined}
          />
        </div>
      ) : (
        <RecentActivity transactions={rows} prefs={prefs} today={today} />
      )}
    </section>
  );
}
