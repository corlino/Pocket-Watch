"use client";

import { Repeat } from "lucide-react";
import { CategoryIcon } from "@/components/categories/category-icon";
import { useComposer } from "./composer-context";
import { formatTransactionAmount } from "@/lib/money";
import { formatDate, formatDateLong } from "@/lib/formatting";
import type { DisplayPrefs, TransactionWithCategory } from "@/features/transactions/types";
import type { IsoDate } from "@/lib/dates/date-only";
import { cn } from "@/lib/utils";

/** F-04 Transaction Row. Tapping opens the edit sheet. */
export function TransactionRow({
  transaction: t,
  prefs,
  showDate = false,
  interactive = true,
  highlight = false,
}: {
  transaction: TransactionWithCategory;
  prefs: DisplayPrefs;
  today?: IsoDate;
  showDate?: boolean;
  interactive?: boolean;
  highlight?: boolean;
}) {
  const { openEdit } = useComposer();
  const amount = formatTransactionAmount(t.amount, t.transaction_type, {
    currency: prefs.currency,
    numberFormat: prefs.numberFormat,
  });
  const title = t.description || t.category.name;
  const isRecurring = Boolean(t.recurring_schedule_id);
  const typeLabel = t.transaction_type === "income" ? "Income" : "Expense";

  const content = (
    <>
      <CategoryIcon icon={t.category.icon} color={t.category.color} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-body font-medium text-fg">{title}</span>
          {isRecurring && (
            <Repeat className="size-3.5 shrink-0 text-fg-muted" aria-label="Recurring" role="img" strokeWidth={2} />
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 truncate text-caption text-fg-muted">
          <span className="truncate">
            {t.category.name}
            {t.category.is_archived ? " (archived)" : ""}
          </span>
          {showDate && (
            <>
              <span aria-hidden>•</span>
              <time dateTime={t.transaction_date}>{formatDate(t.transaction_date, prefs.dateFormat)}</time>
            </>
          )}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className={cn("money text-body font-semibold", t.transaction_type === "income" ? "text-income" : "text-expense")}>
          {amount}
        </span>
        <span className="sr-only">
          {typeLabel}, {formatDateLong(t.transaction_date)}
        </span>
      </span>
    </>
  );

  const base = cn(
    "flex min-h-14 w-full items-center gap-3 rounded-md border border-transparent bg-surface px-3 py-2.5 text-left",
    highlight && "border-chart-yellow/40",
  );

  if (!interactive) return <div className={base}>{content}</div>;

  return (
    <button
      type="button"
      onClick={() => openEdit(t)}
      aria-label={`${title}, ${typeLabel.toLowerCase()} ${amount}, ${t.category.name}, ${formatDateLong(t.transaction_date)}${isRecurring ? ", recurring" : ""}. Edit`}
      className={cn(
        base,
        "transition-colors duration-(--duration-card) ease-(--ease-out) hover:bg-surface-hover",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      )}
    >
      {content}
    </button>
  );
}
