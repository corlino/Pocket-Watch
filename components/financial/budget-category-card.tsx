import { CategoryIcon } from "@/components/categories/category-icon";
import { BudgetProgressBar, BudgetStatusBadge } from "./budget-progress";
import type { BudgetLine } from "@/features/budgets/queries";
import type { DisplayPrefs } from "@/features/transactions/types";
import { formatMoney, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * F-03 Budget Category Card: icon, name, allocation, spent, remaining
 * (negative when over), utilisation and progress.
 */
export function BudgetCategoryCard({
  line,
  prefs,
  compact,
  className,
}: {
  line: BudgetLine;
  prefs: DisplayPrefs;
  compact?: boolean;
  className?: string;
}) {
  const { progress, category } = line;
  const fmt = (v: Parameters<typeof formatMoney>[0]) => formatMoney(v, { currency: prefs.currency, numberFormat: prefs.numberFormat });
  const pct = progress.utilization ? progress.utilization.toNumber() : null;
  const over = progress.remaining.isNegative();

  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5 rounded-lg border border-border bg-surface p-3.5", className)}>
      <div className="flex items-center gap-3">
        <CategoryIcon icon={category.icon} color={category.color} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-fg">{category.name}</p>
          {/* Allowed to wrap: two large amounts must never widen the card. */}
          <p className="text-caption text-fg-muted tabular-nums">
            <span className="whitespace-nowrap">{fmt(progress.spent)}</span> of <span className="whitespace-nowrap">{fmt(progress.allocated)}</span>
          </p>
        </div>
        <p className={cn("money shrink-0 text-body font-semibold", progress.status === "exceeded" ? "text-exceeded" : progress.status === "warning" ? "text-warning" : "text-fg")}>
          {formatPercent(progress.utilization, prefs.numberFormat)}
        </p>
      </div>
      <BudgetProgressBar percent={pct} status={progress.status} label={`${category.name} budget used`} />
      <div className="flex items-center justify-between gap-2">
        <span className={cn("money min-w-0 truncate text-caption", over ? "font-medium text-exceeded" : "text-fg-secondary")}>
          {fmt(progress.remaining)} {over ? "over" : "left"}
        </span>
        <BudgetStatusBadge status={progress.status} />
      </div>
    </div>
  );
}
