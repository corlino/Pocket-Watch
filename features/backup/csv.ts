/**
 * CSV transaction export (PRD FR-PRO-007). RFC 4180 quoting, plus a guard
 * against spreadsheet formula injection: text cells that start with = + - @
 * (or tab/CR) are prefixed with an apostrophe so Excel/Sheets treat them as
 * text. Amounts are plain decimals (no currency symbol) so they stay numeric.
 */

export const CSV_HEADERS = ["Date", "Type", "Category", "Description", "Notes", "Amount", "Signed Amount", "Recurring", "Subscription"] as const;

export type CsvRow = {
  date: string;
  type: "income" | "expense";
  category: string;
  description: string | null;
  notes: string | null;
  amount: string; // exact decimal string
  recurring: boolean;
  subscription: boolean;
};

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: string, { text = true }: { text?: boolean } = {}): string {
  let v = value;
  if (text && FORMULA_START.test(v)) v = `'${v}`;
  return /[",\r\n]/.test(v) || v !== v.trim() ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(rows: CsvRow[]): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.date, { text: false }),
        csvCell(r.type === "income" ? "Income" : "Expense"),
        csvCell(r.category),
        csvCell(r.description ?? ""),
        csvCell(r.notes ?? ""),
        csvCell(r.amount, { text: false }),
        csvCell(r.type === "expense" ? `-${r.amount}` : r.amount, { text: false }),
        r.recurring ? "Yes" : "No",
        r.subscription ? "Yes" : "No",
      ].join(","),
    );
  }
  // CRLF per RFC 4180; BOM so Excel opens UTF-8 (accents, €, £) correctly.
  return "﻿" + lines.join("\r\n") + "\r\n";
}
