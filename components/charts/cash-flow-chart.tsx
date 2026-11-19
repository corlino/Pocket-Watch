"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table2, ChartColumn } from "lucide-react";
import { formatMoney, type Currency, type NumberFormat } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CashFlowPoint = { month: string; label: string; income: string; expenses: string };

const SERIES = [
  { key: "income", name: "Income", color: "var(--color-chart-cyan)" },
  { key: "expenses", name: "Expenses", color: "var(--color-chart-yellow)" },
] as const;

/**
 * F-07 Cash Flow Chart: grouped bars, income vs expenses per month.
 * Legend + tooltip + table view, so identity and values never rely on colour.
 * Amounts arrive as exact strings; Number() is used only for bar geometry.
 */
export function CashFlowChart({
  data,
  currency,
  numberFormat,
  selectedMonth,
}: {
  data: CashFlowPoint[];
  currency: Currency;
  numberFormat: NumberFormat;
  selectedMonth?: string;
}) {
  const [view, setView] = React.useState<"chart" | "table">("chart");
  const fmt = (v: string | number) => formatMoney(String(v), { currency, numberFormat });
  const compact = (v: number) => {
    const sym = formatMoney("0", { currency }).replace(/[\d.,\s ]/g, "");
    return Math.abs(v) >= 1000 ? `${sym}${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `${sym}${v}`;
  };
  const chartData = data.map((d) => ({ ...d, incomeN: Number(d.income), expensesN: Number(d.expenses) }));
  const empty = data.every((d) => Number(d.income) === 0 && Number(d.expenses) === 0);
  const summaryId = React.useId();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <ul className="flex items-center gap-4" aria-label="Legend">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-caption text-fg-secondary">
              <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
        <div className="flex rounded-md border border-border bg-background-secondary p-0.5" role="group" aria-label="Display as">
          {(["chart", "table"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={v === "chart" ? "Chart view" : "Table view"}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand",
                view === v ? "bg-surface-secondary text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {v === "chart" ? <ChartColumn className="size-4" aria-hidden /> : <Table2 className="size-4" aria-hidden />}
            </button>
          ))}
        </div>
      </div>

      {empty ? (
        <p className="rounded-md bg-background-secondary p-6 text-center text-body text-fg-muted">
          Not enough financial activity to display this chart.
        </p>
      ) : view === "chart" ? (
        <figure aria-describedby={summaryId} className="m-0">
          <div className="h-44 md:h-60" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2} barCategoryGap="28%" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={({ x, y, payload, index }) => (
                    <text
                      x={x}
                      y={Number(y) + 12}
                      textAnchor="middle"
                      fontSize={11}
                      fill={chartData[index]?.month === selectedMonth ? "var(--color-fg)" : "var(--color-fg-muted)"}
                      fontWeight={chartData[index]?.month === selectedMonth ? 600 : 400}
                    >
                      {payload.value}
                    </text>
                  )}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fontSize: 11, fill: "var(--color-fg-muted)" }}
                  tickFormatter={compact}
                  tickCount={5}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-surface-hover)", opacity: 0.5 }}
                  content={(props) => <ChartTooltip active={props.active} label={props.label} fmt={fmt} data={data} />}
                />
                <Bar dataKey="incomeN" name="Income" fill={SERIES[0].color} radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
                <Bar dataKey="expensesN" name="Expenses" fill={SERIES[1].color} radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <figcaption id={summaryId} className="sr-only">
            Income and expenses by month.{" "}
            {data.map((d) => `${d.label}: income ${fmt(d.income)}, expenses ${fmt(d.expenses)}.`).join(" ")}
          </figcaption>
        </figure>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <caption className="sr-only">Income and expenses by month</caption>
            <thead>
              <tr className="text-left text-caption text-fg-muted">
                <th scope="col" className="py-2 font-medium">Month</th>
                <th scope="col" className="py-2 text-right font-medium">Income</th>
                <th scope="col" className="py-2 text-right font-medium">Expenses</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.month} className={cn("border-t border-border", d.month === selectedMonth && "font-semibold")}>
                  <th scope="row" className="py-2 text-left font-normal text-fg-secondary">{d.label}</th>
                  <td className="money py-2 text-right text-fg">{fmt(d.income)}</td>
                  <td className="money py-2 text-right text-fg">{fmt(d.expenses)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ChartTooltip({
  active,
  label,
  fmt,
  data,
}: {
  active?: boolean;
  label?: string | number;
  fmt: (v: string) => string;
  data: CashFlowPoint[];
}) {
  if (!active) return null;
  const point = data.find((d) => d.label === label);
  if (!point) return null;
  return (
    <div className="rounded-md border border-border bg-background-elevated px-3 py-2 shadow-float">
      <p className="mb-1 text-caption font-semibold text-fg">{label}</p>
      {SERIES.map((s) => (
        <p key={s.key} className="flex items-center justify-between gap-4 text-caption">
          <span className="flex items-center gap-1.5 text-fg-secondary">
            <span aria-hidden className="size-2 rounded-[2px]" style={{ background: s.color }} />
            {s.name}
          </span>
          <span className="money font-medium text-fg">{fmt(point[s.key])}</span>
        </p>
      ))}
    </div>
  );
}
