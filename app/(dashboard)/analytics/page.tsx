import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Decimal from "decimal.js";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Minus, PiggyBank, Repeat, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/ui/card";
import { LinkTabs } from "@/components/ui/link-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard, KpiSkeleton } from "@/components/financial/kpi-card";
import { BudgetProgressBar, BudgetStatusBadge } from "@/components/financial/budget-progress";
import { CategoryIcon } from "@/components/categories/category-icon";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { ComparisonControls } from "@/components/analytics/comparison-controls";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { INCOME_EXPENSE_SERIES, type ChartSeries } from "@/components/charts/series";
import { BreakdownDonut } from "@/components/charts/breakdown-donut";
import { TrendChart } from "@/components/charts/trend-chart";
import { SavingsMeters } from "@/components/charts/savings-meters";
import { parseAnalyticsFilters, resolveRange, type AnalyticsFilters as Filters } from "@/features/analytics/filters";
import { analyticsTransactions, budgetHistory, type AnalyticsTx } from "@/features/analytics/queries";
import { listSubscriptions, transactionsInRange } from "@/features/budgets/queries";
import { getDisplayPrefs, listCategories } from "@/features/transactions/queries";
import { categoryBreakdown, change, monthlyEquivalent, monthlySeries, savingsSeries, summarize } from "@/lib/calculations";
import { isMonthKey, monthKey, monthRange, parts, shiftMonth, yearRange, type IsoDate, type MonthKey } from "@/lib/dates/date-only";
import { appToday } from "@/lib/dates/today";
import { formatDate, formatMonthShort, formatMonthYear } from "@/lib/formatting";
import { formatMoney, formatPercent, sumMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

type Search = PageProps<"/analytics">["searchParams"];

async function load(searchParams: Search) {
  const [params, today, prefs] = await Promise.all([searchParams, appToday(), getDisplayPrefs()]);
  const filters = parseAnalyticsFilters(params);
  const range = resolveRange(filters, today);
  const all = await analyticsTransactions(range.start, range.end);
  const tx = applyFilters(all, filters);
  return { params, today, prefs, filters, range, all, tx };
}

function applyFilters(rows: AnalyticsTx[], f: Filters) {
  return rows.filter((t) => (f.type === "all" || t.transaction_type === f.type) && (!f.categoryId || t.category_id === f.categoryId));
}

function money(prefs: Awaited<ReturnType<typeof getDisplayPrefs>>) {
  return (v: Decimal | string, sign?: "always") => formatMoney(v, { currency: prefs.currency, numberFormat: prefs.numberFormat, sign });
}

const card = "rounded-lg border border-border bg-surface p-4 md:p-5";

/** Analytics — Financial Insights (PRD §4.2, style guide §9.2). */
export default function AnalyticsPage({ searchParams }: PageProps<"/analytics">) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <Suspense fallback={<div className="h-28" />}>
        <Header searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<KpiSkeleton />}>
        <Kpis searchParams={searchParams} />
      </Suspense>
      <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-2">
        <Suspense fallback={<SectionSkeleton />}>
          <IncomeVsExpenses searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Breakdown searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Trends searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Savings searchParams={searchParams} />
        </Suspense>
      </div>
      <Suspense fallback={<SectionSkeleton />}>
        <Subscriptions searchParams={searchParams} />
      </Suspense>
      <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-2">
        <Suspense fallback={<SectionSkeleton />}>
          <Comparison searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <BudgetHistorySection searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return <div className="h-72 animate-pulse rounded-lg bg-surface" aria-hidden />;
}

async function Header({ searchParams }: { searchParams: Search }) {
  const [{ range, today }, categories] = await Promise.all([load(searchParams), listCategories()]);
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="My Analytics" subtitle={range.label} />
      <AnalyticsFilters categories={categories} currentYear={parts(today).year} currentMonth={monthKey(today)} />
    </div>
  );
}

async function Kpis({ searchParams }: { searchParams: Search }) {
  const { tx, range, prefs, filters } = await load(searchParams);
  const s = summarize(tx, range.start, range.end);
  const fmt = money(prefs);
  // Net and savings rate compare income with expenses — meaningless once
  // the data is narrowed to one type or one category.
  const partial = filters.type !== "all" || Boolean(filters.categoryId);
  return (
    <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard label="Total Income" value={fmt(s.income)} tone="income" icon={TrendingUp} hint={filters.type === "expense" ? "Filtered out" : undefined} />
      <KpiCard label="Total Expenses" value={fmt(s.expenses)} tone="expense" icon={TrendingDown} hint={filters.type === "income" ? "Filtered out" : undefined} />
      {partial ? (
        <>
          <KpiCard label="Net Cash Flow" value="—" srValue="Not available with this filter" icon={Wallet} hint="Needs both income and expenses" elevated />
          <KpiCard label="Savings Rate" value="—" srValue="Not available with this filter" icon={PiggyBank} hint="Clear the type and category filters" elevated />
        </>
      ) : (
        <>
          <KpiCard label="Net Cash Flow" value={fmt(s.netCashFlow)} tone={s.netCashFlow.isNegative() ? "negative" : "neutral"} icon={Wallet} elevated />
          <KpiCard
            label="Savings Rate"
            value={s.savingsRate == null ? "—" : formatPercent(s.savingsRate, prefs.numberFormat)}
            srValue={s.savingsRate == null ? "Unavailable" : undefined}
            tone={s.savingsRate?.isNegative() ? "negative" : "positive"}
            icon={PiggyBank}
            hint={s.savingsRate == null ? "No income in this period" : undefined}
            elevated
          />
        </>
      )}
    </section>
  );
}

function seriesFor(type: Filters["type"]): ChartSeries[] {
  if (type === "income") return [INCOME_EXPENSE_SERIES[0]];
  if (type === "expense") return [INCOME_EXPENSE_SERIES[1]];
  return INCOME_EXPENSE_SERIES;
}

function monthPoints(tx: AnalyticsTx[], months: MonthKey[]) {
  return monthlySeries(tx, months).map((p) => ({
    month: p.month,
    label: formatMonthShort(p.month),
    longLabel: formatMonthYear(monthRange(p.month as MonthKey).start),
    income: p.income.toFixed(2),
    expenses: p.expenses.toFixed(2),
    net: p.net.toFixed(2),
  }));
}

async function IncomeVsExpenses({ searchParams }: { searchParams: Search }) {
  const { tx, range, prefs, filters } = await load(searchParams);
  const data = monthPoints(tx, range.months);
  return (
    <section aria-labelledby="ive" className="min-w-0">
      <SectionHeader id="ive" title="Income vs. Expenses" />
      <div className={card}>
        <CashFlowChart
          data={data}
          currency={prefs.currency}
          numberFormat={prefs.numberFormat}
          series={seriesFor(filters.type)}
          showNet={filters.type === "all"}
        />
      </div>
    </section>
  );
}

async function Breakdown({ searchParams }: { searchParams: Search }) {
  const [{ tx, prefs, filters }, categories] = await Promise.all([load(searchParams), listCategories()]);
  const type = filters.type === "income" ? "income" : "expense";
  const { total, slices } = categoryBreakdown(tx, type, 6);
  const byId = new Map(categories.map((c) => [c.id, c]));
  const items = slices.map((s) => {
    const c = s.categoryId === "other" ? null : byId.get(s.categoryId);
    const key = c?.color ?? "muted";
    return {
      id: s.categoryId,
      name: c?.name ?? "Other",
      icon: c?.icon ?? "circle-ellipsis",
      colorKey: key,
      colorVar: `var(--pw-chart-${key})`,
      amount: s.amount.toFixed(2),
      percent: s.percent.toFixed(2),
    };
  });
  const title = type === "income" ? "Income Breakdown" : "Expense Breakdown";
  return (
    <section aria-labelledby="breakdown" className="min-w-0">
      <SectionHeader id="breakdown" title={title} />
      <div className={card}>
        {items.length === 0 ? (
          <p className="py-8 text-center text-body text-fg-muted">Not enough financial activity to display this chart.</p>
        ) : (
          <BreakdownDonut
            items={items}
            total={total.toFixed(2)}
            totalLabel={type === "income" ? "Total income" : "Total expenses"}
            currency={prefs.currency}
            numberFormat={prefs.numberFormat}
          />
        )}
        {filters.categoryId && items.length > 0 && <p className="mt-3 text-caption text-fg-muted">Filtered to one category — clear the category filter to compare categories.</p>}
      </div>
    </section>
  );
}

async function Trends({ searchParams }: { searchParams: Search }) {
  const { tx, range, prefs, filters } = await load(searchParams);
  const data = monthPoints(tx, range.months);
  const series: ChartSeries[] =
    filters.type === "all" ? [...INCOME_EXPENSE_SERIES, { key: "net", name: "Net cash flow", color: "var(--pw-text-primary)", dashed: true }] : seriesFor(filters.type);
  const empty = data.every((d) => d.income === "0.00" && d.expenses === "0.00");
  return (
    <section aria-labelledby="trends" className="min-w-0">
      <SectionHeader id="trends" title="Monthly Trends" />
      <div className={card}>
        {empty || data.length < 2 ? (
          <p className="py-8 text-center text-body text-fg-muted">
            {data.length < 2 ? "Choose a range of two months or more to see trends." : "Not enough financial activity to display this chart."}
          </p>
        ) : (
          <TrendChart data={data} series={series} currency={prefs.currency} numberFormat={prefs.numberFormat} />
        )}
      </div>
    </section>
  );
}

async function Savings({ searchParams }: { searchParams: Search }) {
  const { all, range, prefs, filters } = await load(searchParams);
  const rows = savingsSeries(monthlySeries(all, range.months))
    .map((r) => ({ label: formatMonthShort(r.month), rate: r.rate }))
    .reverse();
  const filtered = filters.type !== "all" || Boolean(filters.categoryId);
  return (
    <section aria-labelledby="savings" className="min-w-0">
      <SectionHeader id="savings" title="Savings" />
      <div className={card}>
        <p className="mb-3 text-caption text-fg-muted">
          Share of each month&apos;s income left after expenses{filtered ? " — uses all transactions, ignoring the type and category filters" : ""}.
        </p>
        <SavingsMeters rows={rows} numberFormat={prefs.numberFormat} />
      </div>
    </section>
  );
}

async function Subscriptions({ searchParams }: { searchParams: Search }) {
  const [{ all, range, prefs, filters, today }, subs] = await Promise.all([load(searchParams), listSubscriptions()]);
  if (filters.type === "income") return null;
  const fmt = money(prefs);
  const scoped = all.filter((t) => t.transaction_type === "expense" && (!filters.categoryId || t.category_id === filters.categoryId));
  const data = range.months.map((m) => {
    const { start, end } = monthRange(m);
    const inMonth = scoped.filter((t) => t.transaction_date >= start && t.transaction_date <= end);
    return {
      month: m,
      label: formatMonthShort(m),
      longLabel: formatMonthYear(start),
      subscriptions: sumMoney(inMonth.filter((t) => t.is_subscription).map((t) => t.amount)).toFixed(2),
      other: sumMoney(inMonth.filter((t) => !t.is_subscription).map((t) => t.amount)).toFixed(2),
    };
  });
  const monthlyTotal = sumMoney(subs.map((s) => monthlyEquivalent(s.amount, s.recurrence_interval)));

  return (
    <section aria-labelledby="subs" className="min-w-0">
      <SectionHeader
        id="subs"
        title="Subscriptions"
        action={
          <Link href="/budget?tab=subscriptions" className="inline-flex min-h-11 items-center gap-1 text-caption font-medium text-brand hover:underline">
            Manage <ChevronRight className="size-4" aria-hidden />
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={card}>
          <h3 className="mb-3 text-body font-semibold text-fg">Monthly expenses</h3>
          <CashFlowChart
            data={data}
            currency={prefs.currency}
            numberFormat={prefs.numberFormat}
            showNet={false}
            title="Subscription and other expenses by month"
            series={[
              { key: "other", name: "Other expenses", color: "var(--pw-chart-yellow)" },
              { key: "subscriptions", name: "Subscriptions", color: "var(--pw-chart-coral)" },
            ]}
          />
        </div>
        <div className={card}>
          {subs.length === 0 ? (
            <EmptyState icon={Repeat} title="No subscriptions added yet." description="Add them on the Budget page to track their monthly cost here." />
          ) : (
            <>
              <dl className="mb-4 grid grid-cols-3 gap-2">
                <div>
                  <dt className="text-caption text-fg-muted">Active</dt>
                  <dd className="money text-h3 font-semibold text-fg">{subs.length}</dd>
                </div>
                <div>
                  <dt className="text-caption text-fg-muted">Per month</dt>
                  <dd className="money text-h3 font-semibold text-fg">{fmt(monthlyTotal)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-fg-muted">Per year</dt>
                  <dd className="money text-h3 font-semibold text-fg">{fmt(monthlyTotal.times(12))}</dd>
                </div>
              </dl>
              <ul className="flex flex-col divide-y divide-border" aria-label="Active subscriptions">
                {subs.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2.5">
                    <CategoryIcon icon={s.icon ?? s.category.icon} color={s.category.color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-medium text-fg">{s.description || s.category.name}</p>
                      <p className="truncate text-caption text-fg-muted">
                        {s.recurrence_interval === "weekly" ? "Weekly" : "Monthly"} · Next{" "}
                        <span className={s.next_scheduled_date === today ? "font-medium text-warning" : undefined}>
                          {formatDate(s.next_scheduled_date, prefs.dateFormat)}
                        </span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="money text-body font-semibold text-fg">{fmt(s.amount)}</p>
                      <p className="money text-caption text-fg-muted">
                        {s.recurrence_interval === "weekly" ? `≈ ${fmt(monthlyEquivalent(s.amount, s.recurrence_interval))}/mo` : "per month"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-caption text-fg-muted">Tracked manually — Pocket Watch doesn&apos;t connect to any provider.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

async function Comparison({ searchParams }: { searchParams: Search }) {
  const [{ params, today, prefs, filters }] = await Promise.all([load(searchParams)]);
  const get = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const mode: "month" | "year" = get("cmp") === "year" ? "year" : "month";
  const current = monthKey(today);
  const thisYear = parts(today).year;

  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const m = shiftMonth(current, -i);
    return { value: m, label: formatMonthYear(monthRange(m).start) };
  });
  const yearOptions = Array.from({ length: 8 }, (_, i) => ({ value: String(thisYear - i), label: String(thisYear - i) }));

  const valid = (v: string | undefined, fallback: string) =>
    v && (mode === "month" ? isMonthKey(v) : /^\d{4}$/.test(v)) ? v : fallback;
  const b = valid(get("cb"), mode === "month" ? current : String(thisYear));
  const a = valid(get("ca"), mode === "month" ? shiftMonth(current, -1) : String(thisYear - 1));

  const rangeOf = (p: string): { start: IsoDate; end: IsoDate } => (mode === "month" ? monthRange(p as MonthKey) : yearRange(Number(p)));
  const [ra, rb] = [rangeOf(a), rangeOf(b)];
  const [txa, txb] = await Promise.all([transactionsInRange(ra.start, ra.end), transactionsInRange(rb.start, rb.end)]);
  const scope = (rows: typeof txa) => rows.filter((t) => !filters.categoryId || t.category_id === filters.categoryId);
  const sa = summarize(scope(txa), ra.start, ra.end);
  const sb = summarize(scope(txb), rb.start, rb.end);
  const labelOf = (p: string) => (mode === "month" ? formatMonthYear(monthRange(p as MonthKey).start) : p);
  const fmt = money(prefs);

  const rows = [
    { name: "Income", c: change(sa.income, sb.income), goodWhenUp: true },
    { name: "Expenses", c: change(sa.expenses, sb.expenses), goodWhenUp: false },
    { name: "Net cash flow", c: change(sa.netCashFlow, sb.netCashFlow), goodWhenUp: true },
  ];

  return (
    <section aria-labelledby="compare" className="min-w-0">
      <SectionHeader id="compare" title="Historical Comparison" />
      <div className={cn(card, "flex flex-col gap-4")}>
        <ComparisonControls mode={mode} a={a} b={b} monthOptions={monthOptions} yearOptions={yearOptions} />
        <table className="w-full text-body">
          <caption className="sr-only">
            {labelOf(a)} compared with {labelOf(b)}
          </caption>
          <thead>
            <tr className="text-left text-caption text-fg-muted">
              <th scope="col" className="py-2 font-medium"><span className="sr-only">Measure</span></th>
              <th scope="col" className="py-2 text-right font-medium">{labelOf(a)}</th>
              <th scope="col" className="py-2 text-right font-medium">{labelOf(b)}</th>
              <th scope="col" className="py-2 text-right font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ name, c, goodWhenUp }) => {
              const up = c.delta.gt(0);
              const down = c.delta.lt(0);
              const good = (up && goodWhenUp) || (down && !goodWhenUp);
              const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
              return (
                <tr key={name} className="border-t border-border">
                  <th scope="row" className="py-2.5 text-left font-medium text-fg">{name}</th>
                  <td className="money py-2.5 text-right text-fg-secondary">{fmt(c.from)}</td>
                  <td className="money py-2.5 text-right text-fg">{fmt(c.to)}</td>
                  <td className={cn("money py-2.5 text-right font-medium", c.delta.isZero() ? "text-fg-muted" : good ? "text-positive" : "text-negative")}>
                    <span className="inline-flex items-center justify-end gap-1">
                      <Icon className="size-3.5" aria-hidden />
                      <span>
                        {c.percent == null ? (c.delta.isZero() ? "No change" : fmt(c.delta, "always")) : formatPercent(c.percent.abs(), prefs.numberFormat)}
                      </span>
                      <span className="sr-only">{up ? "increase" : down ? "decrease" : ""}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filters.categoryId && <p className="text-caption text-fg-muted">Limited to the selected category.</p>}
      </div>
    </section>
  );
}

async function BudgetHistorySection({ searchParams }: { searchParams: Search }) {
  const { params, range, prefs, filters } = await load(searchParams);
  const yearly = params.bh === "yearly";
  const periods = yearly
    ? [...new Set(range.months.map((m) => m.slice(0, 4)))]
    : range.months.map(String);
  const history = await budgetHistory(yearly ? "yearly" : "monthly", periods, filters.categoryId);
  const fmt = money(prefs);
  const tabHref = (bh: "monthly" | "yearly") => {
    const q = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => typeof e[1] === "string"));
    if (bh === "yearly") q.set("bh", "yearly");
    else q.delete("bh");
    return `/analytics?${q}`;
  };

  return (
    <section aria-labelledby="bhist" className="min-w-0">
      <SectionHeader id="bhist" title="Budget History" />
      <div className={cn(card, "flex flex-col gap-4")}>
        <LinkTabs
          label="Budget history period"
          size="sm"
          items={[
            { href: tabHref("monthly"), label: "Monthly", active: !yearly },
            { href: tabHref("yearly"), label: "Yearly", active: yearly },
          ]}
        />
        {history.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={`No ${yearly ? "yearly" : "monthly"} budgets in this range`}
            description="Budgets you set on the Budget page will be compared with actual spending here."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {history.slice(0, yearly ? 5 : 6).map((p) => (
              <div key={p.id}>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-body font-semibold text-fg">{yearly ? p.id : formatMonthYear(monthRange(p.id as MonthKey).start)}</h3>
                  <p className="money text-caption text-fg-secondary">
                    {fmt(p.totals.spent)} of {fmt(p.totals.allocated)} · {formatPercent(p.totals.utilization, prefs.numberFormat)}
                  </p>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {p.lines.map((l) => (
                    <li key={l.category.id} className="flex items-center gap-3">
                      <CategoryIcon icon={l.category.icon} color={l.category.color} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-caption font-medium text-fg">{l.category.name}</span>
                          <span className="money shrink-0 text-caption text-fg-secondary">
                            {fmt(l.progress.spent)} / {fmt(l.progress.allocated)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1">
                            <BudgetProgressBar percent={l.progress.utilization?.toNumber() ?? null} status={l.progress.status} label={`${l.category.name} budget used`} />
                          </div>
                          <BudgetStatusBadge status={l.progress.status} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {history.length > (yearly ? 5 : 6) && <p className="text-caption text-fg-muted">Showing the most recent periods in this range.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
