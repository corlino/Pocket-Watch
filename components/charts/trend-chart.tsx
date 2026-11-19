"use client";

import * as React from "react";
import { useCanHover } from "@/hooks/use-can-hover";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, type Currency, type NumberFormat } from "@/lib/money";
import type { CashFlowPoint } from "./cash-flow-chart";
import type { ChartSeries } from "./series";

/** Readable ticks spanning [min, max], including zero, ~4 intervals. */
export function niceDomainTicks(min: number, max: number): number[] {
  const lo = Math.min(0, min);
  const hi = Math.max(0, max);
  const span = hi - lo || 1;
  const raw = span / 4;
  const exp = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * exp).find((s) => Math.ceil(hi / s) - Math.floor(lo / s) <= 4) ?? 10 * exp;
  const ticks: number[] = [];
  for (let v = Math.floor(lo / step) * step; v <= Math.ceil(hi / step) * step + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/**
 * FR-AN-004 Monthly financial trends: 2px lines with ≥8px markers, one axis,
 * zero reference line (net can go negative). Legend always present; the
 * last point of each series is direct-labelled in the legend with its value.
 */
export function TrendChart({
  data,
  series,
  currency,
  numberFormat,
}: {
  data: CashFlowPoint[];
  series: ChartSeries[];
  currency: Currency;
  numberFormat: NumberFormat;
}) {
  const canHover = useCanHover();
  const fmt = (v: string | number) => formatMoney(String(v), { currency, numberFormat });
  const symbol = formatMoney("0", { currency }).replace(/[\d.,\s ]/g, "");
  const compact = (v: number) => {
    const a = Math.abs(v);
    const s = a >= 1000 ? `${symbol}${Number((a / 1000).toFixed(1))}k` : `${symbol}${a}`;
    return v < 0 ? `-${s}` : s;
  };
  const chartData = data.map((d) => ({ ...d, ...Object.fromEntries(series.map((s) => [`${s.key}N`, Number(d[s.key] ?? 0)])) }));
  const values = chartData.flatMap((d) => series.map((s) => Number((d as Record<string, unknown>)[`${s.key}N`])));
  const ticks = niceDomainTicks(Math.min(...values), Math.max(...values));
  const last = data[data.length - 1];
  const summaryId = React.useId();

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legend">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-caption text-fg-secondary">
            <svg aria-hidden width="16" height="4" className="shrink-0">
              <line x1="1" y1="2" x2="15" y2="2" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeDasharray={s.dashed ? "3 3" : undefined} />
            </svg>
            {s.name}
            {last && <span className="money font-medium text-fg">{fmt(last[s.key] ?? "0")}</span>}
          </li>
        ))}
      </ul>
      <figure className="m-0" aria-describedby={summaryId}>
        <div className="h-52 md:h-64" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -6 }} accessibilityLayer={false}>
              <CartesianGrid vertical={false} stroke="var(--pw-border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} interval={data.length > 8 ? "preserveStartEnd" : 0} minTickGap={4} tick={{ fontSize: 12, fill: "var(--pw-text-muted)" }} />
              <YAxis tickLine={false} axisLine={false} width={44} ticks={ticks} domain={[ticks[0], ticks[ticks.length - 1]]} interval={0} tick={{ fontSize: 11, fill: "var(--pw-text-muted)" }} tickFormatter={compact} />
              <ReferenceLine y={0} stroke="var(--pw-border-strong)" />
              {canHover && (
                <Tooltip
                  cursor={{ stroke: "var(--pw-border-strong)" }}
                  content={({ active, label }) => {
                    const p = data.find((d) => d.label === label);
                    if (!active || !p) return null;
                    return (
                      <div className="rounded-md border border-border bg-background-elevated px-3 py-2 shadow-float">
                        <p className="mb-1 text-caption font-semibold text-fg">{p.longLabel}</p>
                        {series.map((s) => (
                          <p key={s.key} className="flex items-center justify-between gap-4 text-caption">
                            <span className="flex items-center gap-1.5 text-fg-secondary">
                              <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                              {s.name}
                            </span>
                            <span className="money font-medium text-fg">{fmt(p[s.key] ?? "0")}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
              )}
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={`${s.key}N`}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? "5 4" : undefined}
                  dot={{ r: 4, fill: s.color, stroke: "var(--pw-surface)", strokeWidth: 2 }}
                  activeDot={{ r: 5, stroke: "var(--pw-surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <figcaption id={summaryId} className="sr-only">
          Trends by month. {data.map((d) => `${d.longLabel}: ${series.map((s) => `${s.name.toLowerCase()} ${fmt(d[s.key] ?? "0")}`).join(", ")}.`).join(" ")}
        </figcaption>
      </figure>
    </div>
  );
}
