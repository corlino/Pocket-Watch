"use client";

import * as React from "react";
import { useCanHover } from "@/hooks/use-can-hover";
import { INCOME_EXPENSE_SERIES, type ChartSeries } from "./series";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartColumn, Table2 } from "lucide-react";
import { formatMoney, toDecimal, type Currency, type NumberFormat } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CashFlowPoint = { month: string; label: string; longLabel: string } & Record<string, string>;
export type { ChartSeries } from "./series";

/** Round axis maximum and step so ticks land on 0 / 1k / 2k / 3k-style values. */
export function niceTicks(max: number, intervals = 3): number[] {
  if (!(max > 0)) return Array.from({ length: intervals + 1 }, (_, i) => i);
  const raw = max / intervals;
  const exp = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * exp).find((s) => s * intervals >= max) ?? 10 * exp;
  return Array.from({ length: intervals + 1 }, (_, i) => Number((i * step).toPrecision(12)));
}

/**
 * F-07 Cash Flow Chart: grouped bars, income vs expenses per month.
 * A figures row always shows exact amounts for the selected month (tap a
 * month to select it — no hover needed on phones). Legend, table view and a
 * text summary keep it accessible. Amounts arrive as exact strings; Number()
 * is used only for bar geometry.
 */
export function CashFlowChart({
  data,
  currency,
  numberFormat,
  selectedMonth,
  series = INCOME_EXPENSE_SERIES,
  showNet = true,
  title = "Income and expenses by month",
}: {
  data: CashFlowPoint[];
  currency: Currency;
  numberFormat: NumberFormat;
  selectedMonth?: string;
  /** Bars per month, in fixed order (colour follows the series). */
  series?: ChartSeries[];
  /** Show Net (first series minus second) in the figures row. */
  showNet?: boolean;
  title?: string;
}) {
  const SERIES = series;
  const [view, setView] = React.useState<"chart" | "table">("chart");
  const [focusMonth, setFocusMonth] = React.useState(selectedMonth ?? data[data.length - 1]?.month);
  const canHover = useCanHover();

  const fmt = (v: string) => formatMoney(v, { currency, numberFormat });
  const symbol = formatMoney("0", { currency }).replace(/[\d.,\s ]/g, "");
  const compact = (v: number) => (v >= 1000 ? `${symbol}${Number((v / 1000).toFixed(1))}k` : `${symbol}${v}`);

  const chartData = data.map((d) => ({ ...d, ...Object.fromEntries(SERIES.map((s) => [`${s.key}N`, Number(d[s.key] ?? 0)])) })) as (CashFlowPoint & Record<string, number | string>)[];
  const max = Math.max(0, ...chartData.flatMap((d) => SERIES.map((s) => Number(d[`${s.key}N`]))));
  const ticks = niceTicks(max);
  const empty = max === 0;
  const focus = data.find((d) => d.month === focusMonth) ?? data[data.length - 1];
  const net = focus && showNet && SERIES.length >= 2 ? toDecimal(focus[SERIES[0].key] ?? "0").minus(focus[SERIES[1].key] ?? "0") : null;
  const summaryId = React.useId();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-medium text-fg-secondary" aria-live="polite">
          {focus?.longLabel}
        </p>
        <div className="flex shrink-0 rounded-md border border-border bg-background-secondary p-0.5" role="group" aria-label="Display as">
          {(["chart", "table"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={v === "chart" ? "Chart view" : "Table view"}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand",
                view === v ? "bg-surface-secondary text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {v === "chart" ? <ChartColumn className="size-4" aria-hidden /> : <Table2 className="size-4" aria-hidden />}
            </button>
          ))}
        </div>
      </div>
      {/* The figures double as the legend: swatch + series name + value. */}
      {focus && (
        <dl className="-mt-1 grid grid-cols-3 gap-2" aria-label="Legend and figures" aria-live="polite">
          {SERIES.map((s) => (
            <Figure key={s.key} label={s.name} value={fmt(focus[s.key] ?? "0")} swatch={s.color} />
          ))}
          {net && (
            <Figure label="Net" value={formatMoney(net, { currency, numberFormat, sign: "always" })} tone={net.isNegative() ? "text-negative" : "text-fg"} />
          )}
        </dl>
      )}

      {empty ? (
        <p className="rounded-md bg-background-secondary p-6 text-center text-body text-fg-muted">
          Not enough financial activity to display this chart.
        </p>
      ) : view === "chart" ? (
        <figure aria-describedby={summaryId} className="m-0">
          <div className="h-52 md:h-60" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                barGap={2}
                barCategoryGap="22%"
                margin={{ top: 6, right: 0, bottom: 0, left: -6 }}
                onClick={(state) => {
                  const i = Number(state?.activeTooltipIndex);
                  if (Number.isInteger(i) && chartData[i]) setFocusMonth(chartData[i].month);
                }}
                className="cursor-pointer"
                // Visual only (wrapper is aria-hidden); keyboard/screen-reader
                // users get the table view and the text summary.
                accessibilityLayer={false}
                tabIndex={-1}
              >
                <CartesianGrid vertical={false} stroke="var(--pw-border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval={data.length > 8 ? "preserveStartEnd" : 0}
                  minTickGap={4}
                  tick={({ x, y, payload, index }) => {
                    const isFocus = chartData[index]?.month === focus?.month;
                    return (
                      <text x={x} y={Number(y) + 13} textAnchor="middle" fontSize={12} fill={isFocus ? "var(--pw-text-primary)" : "var(--pw-text-muted)"} fontWeight={isFocus ? 600 : 400}>
                        {payload.value}
                      </text>
                    );
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  ticks={ticks}
                  domain={[0, ticks[ticks.length - 1]]}
                  interval={0}
                  tick={{ fontSize: 11, fill: "var(--pw-text-muted)" }}
                  tickFormatter={compact}
                />
                {canHover && (
                  <Tooltip
                    cursor={{ fill: "var(--pw-surface-hover)", opacity: 0.5 }}
                    content={(props) => <ChartTooltip active={props.active} label={props.label} fmt={fmt} data={data} series={SERIES} />}
                  />
                )}
                {SERIES.map((s) => (
                  <Bar key={s.key} dataKey={`${s.key}N`} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={16} isAnimationActive={false}>
                    {chartData.map((d) => (
                      <Cell key={d.month} fillOpacity={d.month === focus?.month ? 1 : 0.55} />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <figcaption id={summaryId} className="sr-only">
            {title}. {data.map((d) => `${d.longLabel}: ${SERIES.map((s) => `${s.name.toLowerCase()} ${fmt(d[s.key] ?? "0")}`).join(", ")}.`).join(" ")}
          </figcaption>
          <p className="mt-1 text-center text-caption text-fg-muted" aria-hidden>
            Tap a month to see its figures
          </p>
        </figure>
      ) : (
        <table className="w-full text-body">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="text-left text-caption text-fg-muted">
              <th scope="col" className="py-2 font-medium">Month</th>
              {SERIES.map((s) => (
                <th key={s.key} scope="col" className="py-2 text-right font-medium">{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month} className={cn("border-t border-border", d.month === focus?.month && "font-semibold")}>
                <th scope="row" className="py-2 text-left font-normal text-fg-secondary">{d.label}</th>
                {SERIES.map((s) => (
                  <td key={s.key} className="money py-2 text-right text-fg">{fmt(d[s.key] ?? "0")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Figure({ label, value, swatch, tone = "text-fg" }: { label: string; value: string; swatch?: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-caption text-fg-muted">
        {swatch && <span aria-hidden className="size-2 rounded-[2px]" style={{ background: swatch }} />}
        {label}
      </dt>
      <dd className={cn("money truncate text-body font-semibold", tone)}>{value}</dd>
    </div>
  );
}

function ChartTooltip({
  active,
  label,
  fmt,
  data,
  series: SERIES,
}: {
  active?: boolean;
  label?: string | number;
  fmt: (v: string) => string;
  data: CashFlowPoint[];
  series: ChartSeries[];
}) {
  if (!active) return null;
  const point = data.find((d) => d.label === label);
  if (!point) return null;
  return (
    <div className="rounded-md border border-border bg-background-elevated px-3 py-2 shadow-float">
      <p className="mb-1 text-caption font-semibold text-fg">{point.longLabel}</p>
      {SERIES.map((s) => (
        <p key={s.key} className="flex items-center justify-between gap-4 text-caption">
          <span className="flex items-center gap-1.5 text-fg-secondary">
            <span aria-hidden className="size-2 rounded-[2px]" style={{ background: s.color }} />
            {s.name}
          </span>
          <span className="money font-medium text-fg">{fmt(point[s.key] ?? "0")}</span>
        </p>
      ))}
    </div>
  );
}
