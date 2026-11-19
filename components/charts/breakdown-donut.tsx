"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CategoryIcon } from "@/components/categories/category-icon";
import { formatMoney, type Currency, type NumberFormat } from "@/lib/money";
import { cn } from "@/lib/utils";
import { figureSizeMd } from "@/components/financial/fit-text";

export type BreakdownItem = {
  id: string;
  name: string;
  icon: string | null;
  colorVar: string; // CSS colour, e.g. var(--pw-chart-cyan)
  colorKey: string;
  amount: string;
  percent: string; // "63.64"
};

/**
 * F-03/FR-AN-003 Expense (or income) breakdown: a donut (per the PRD and
 * Style Guide) paired with a ranked list carrying icon, name, amount, share
 * and a bar — so categories are identified and compared without relying on
 * colour, and neighbouring similar hues stay unambiguous.
 */
export function BreakdownDonut({
  items,
  total,
  totalLabel,
  currency,
  numberFormat,
}: {
  items: BreakdownItem[];
  total: string;
  totalLabel: string;
  currency: Currency;
  numberFormat: NumberFormat;
}) {
  const fmt = (v: string) => formatMoney(v, { currency, numberFormat });
  const pct = (v: string) => `${numberFormat === "comma-dot" ? Number(v).toFixed(1) : Number(v).toFixed(1).replace(".", ",")}%`;
  const data = items.map((i) => ({ ...i, value: Number(i.amount) }));

  return (
    // Lays out by the card's own width (container query), not the screen:
    // side by side only when there's room for full category names.
    <div className="@container">
      <div className="grid grid-cols-1 items-center gap-5 @lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
      <figure className="relative mx-auto aspect-square w-full max-w-[220px]" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer={false}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={items.length > 1 ? 1.5 : 0}
              cornerRadius={4}
              stroke="var(--pw-surface)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={d.colorVar} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <figcaption className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-caption text-fg-muted">{totalLabel}</span>
          <span className={cn("money max-w-[70%] font-semibold text-fg", figureSizeMd(fmt(total)))}>{fmt(total)}</span>
        </figcaption>
      </figure>

      <ol className="flex flex-col gap-2.5" aria-label={`${totalLabel} by category`}>
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-3">
            <CategoryIcon icon={i.icon} color={i.colorKey} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-body font-medium text-fg">{i.name}</span>
                <span className="money shrink-0 text-body font-semibold text-fg">{fmt(i.amount)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-tertiary" aria-hidden>
                  <div className="h-full rounded-full" style={{ width: `${Math.max(1, Number(i.percent))}%`, background: i.colorVar }} />
                </div>
                <span className="money w-12 shrink-0 text-right text-caption text-fg-muted">{pct(i.percent)}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
      </div>
    </div>
  );
}
