import { TransactionRow } from "./transaction-row";
import { formatDayHeading } from "@/lib/formatting";
import { formatMoney, sumMoney } from "@/lib/money";
import type { DisplayPrefs, TransactionWithCategory } from "@/features/transactions/types";
import type { IsoDate } from "@/lib/dates/date-only";

/**
 * Transaction history list grouped by day (F-06), newest first.
 * Each day shows its net total.
 */
export function TransactionList({
  transactions,
  prefs,
  today,
  grouped = true,
}: {
  transactions: TransactionWithCategory[];
  prefs: DisplayPrefs;
  today: IsoDate;
  grouped?: boolean;
}) {
  if (!grouped) {
    return (
      <ul className="flex flex-col gap-2">
        {transactions.map((t) => (
          <li key={t.id}>
            <TransactionRow transaction={t} prefs={prefs} today={today} showDate />
          </li>
        ))}
      </ul>
    );
  }

  const groups = new Map<string, TransactionWithCategory[]>();
  for (const t of transactions) {
    const list = groups.get(t.transaction_date) ?? [];
    list.push(t);
    groups.set(t.transaction_date, list);
  }

  return (
    <div className="flex flex-col gap-5">
      {[...groups.entries()].map(([date, rows]) => {
        const net = sumMoney(rows.map((r) => (r.transaction_type === "income" ? r.amount : `-${r.amount}`)));
        return (
          <section key={date} aria-labelledby={`day-${date}`}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h3 id={`day-${date}`} className="text-caption font-semibold tracking-wide text-fg-secondary uppercase">
                {formatDayHeading(date as IsoDate, today)}
              </h3>
              <span className="money text-caption text-fg-muted">
                <span className="sr-only">Day net </span>
                {formatMoney(net, { currency: prefs.currency, numberFormat: prefs.numberFormat, sign: "always" })}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {rows.map((t) => (
                <li key={t.id}>
                  <TransactionRow transaction={t} prefs={prefs} today={today} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function TransactionListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-busy="true" aria-label="Loading transactions">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex h-14 items-center gap-3 rounded-md bg-surface px-3">
          <div className="size-10 animate-pulse rounded-md bg-surface-tertiary" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-surface-tertiary" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-surface-tertiary" />
          </div>
          <div className="h-3.5 w-16 animate-pulse rounded bg-surface-tertiary" />
        </div>
      ))}
    </div>
  );
}
