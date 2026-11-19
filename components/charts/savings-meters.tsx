import { formatPercent, type NumberFormat } from "@/lib/money";
import type Decimal from "decimal.js";
import { cn } from "@/lib/utils";

/**
 * F-09 Savings chart as a meter list: one row per month (name, bar, figure).
 * Negative rates show as an empty bar with the figure in the negative colour;
 * months without income say so instead of inventing a rate.
 */
export function SavingsMeters({
  rows,
  numberFormat,
}: {
  rows: { label: string; rate: Decimal | null }[];
  numberFormat: NumberFormat;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const v = r.rate?.toNumber() ?? null;
        const width = v == null ? 0 : Math.max(0, Math.min(100, v));
        return (
          <li key={r.label} className="grid grid-cols-[3.25rem_minmax(0,1fr)_4.5rem] items-center gap-3">
            <span className="text-caption text-fg-secondary">{r.label}</span>
            <div
              className="h-2 overflow-hidden rounded-full bg-surface-tertiary"
              role="meter"
              aria-label={`Savings rate, ${r.label}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={v == null ? undefined : Math.round(width)}
              aria-valuetext={v == null ? "No income" : formatPercent(r.rate, numberFormat)}
            >
              <div className="h-full rounded-full bg-chart-mint" style={{ width: `${width}%` }} />
            </div>
            <span className={cn("money text-right text-caption font-medium", v == null ? "text-fg-muted" : v < 0 ? "text-negative" : "text-fg")}>
              {v == null ? "No income" : formatPercent(r.rate, numberFormat)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
