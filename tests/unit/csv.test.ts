import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/features/backup/csv";

describe("CSV export", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('Coffee, "large"')).toBe('"Coffee, ""large"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(csvCell("plain")).toBe("plain");
  });
  it("neutralises spreadsheet formulas in text cells only", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+1 call")).toBe("'+1 call");
    expect(csvCell("-12.50", { text: false })).toBe("-12.50");
  });
  it("writes a header, signed amounts and a UTF-8 BOM", () => {
    const csv = toCsv([
      { date: "2026-11-19", type: "expense", category: "Dining & Restaurants", description: "Café", notes: null, amount: "12.50", recurring: false, subscription: false },
      { date: "2026-11-01", type: "income", category: "Salary", description: null, notes: "Nov", amount: "4200.00", recurring: true, subscription: false },
    ]);
    expect(csv.startsWith("﻿Date,Type,Category")).toBe(true);
    const lines = csv.slice(1).trimEnd().split("\r\n");
    expect(lines[1]).toBe("2026-11-19,Expense,Dining & Restaurants,Café,,12.50,-12.50,No,No");
    expect(lines[2]).toBe("2026-11-01,Income,Salary,,Nov,4200.00,4200.00,Yes,No");
  });
});
