/** Chart series definitions shared by server and client components. */
export type ChartSeries = { key: string; name: string; color: string; dashed?: boolean };

export const INCOME_EXPENSE_SERIES: ChartSeries[] = [
  { key: "income", name: "Income", color: "var(--pw-chart-cyan)" },
  { key: "expenses", name: "Expenses", color: "var(--pw-chart-yellow)" },
];
