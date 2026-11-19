import { ChevronDown, ReceiptText } from "lucide-react";
import { CategoryIcon } from "@/components/categories/category-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionRow } from "@/components/transactions/transaction-row";
import type { DisplayPrefs, TransactionWithCategory } from "@/features/transactions/types";
import type { IsoDate } from "@/lib/dates/date-only";
import { formatMoney, sumMoney } from "@/lib/money";

/**
 * F-05 Transaction Groups: the period's expenses grouped by category,
 * collapsible (native <details>, so it works without JavaScript).
 * FR-BUD-006: ?category= opens that category's group.
 */
export function CategoryTransactionGroups({
  transactions,
  prefs,
  today,
  openCategoryId,
}: {
  transactions: TransactionWithCategory[];
  prefs: DisplayPrefs;
  today: IsoDate;
  openCategoryId?: string;
}) {
  if (!transactions.length) {
    return (
      <div className="rounded-lg border border-border bg-surface">
        <EmptyState icon={ReceiptText} title="No expenses in this period" description="Expenses you record will be grouped by category here." />
      </div>
    );
  }

  const groups = new Map<string, TransactionWithCategory[]>();
  for (const t of transactions) groups.set(t.category.id, [...(groups.get(t.category.id) ?? []), t]);
  const ordered = [...groups.values()]
    .map((rows) => ({ rows, total: sumMoney(rows.map((r) => r.amount)) }))
    .sort((a, b) => b.total.comparedTo(a.total));

  return (
    <div className="flex flex-col gap-2">
      {ordered.map(({ rows, total }) => {
        const c = rows[0].category;
        return (
          <details key={c.id} open={c.id === openCategoryId || ordered.length === 1} className="group rounded-lg border border-border bg-surface">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
              <CategoryIcon icon={c.icon} color={c.color} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-medium text-fg">{c.name}</span>
                <span className="block text-caption text-fg-muted">
                  {rows.length} transaction{rows.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className="money text-body font-semibold text-fg">{formatMoney(total, { currency: prefs.currency, numberFormat: prefs.numberFormat })}</span>
              <ChevronDown className="size-4 text-fg-muted transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ul className="flex flex-col gap-1.5 border-t border-border p-2 pl-4">
              {rows.map((t) => (
                <li key={t.id}>
                  <TransactionRow transaction={t} prefs={prefs} today={today} showDate />
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
