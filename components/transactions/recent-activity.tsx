"use client";

import * as React from "react";
import { FilterChips } from "@/components/ui/filter-chip";
import { TransactionRow } from "./transaction-row";
import type { DisplayPrefs, TransactionWithCategory } from "@/features/transactions/types";
import type { IsoDate } from "@/lib/dates/date-only";

/** F-06 Financial Activity List with All / Income / Expenses chips. */
export function RecentActivity({
  transactions,
  prefs,
  today,
  limit = 6,
}: {
  transactions: TransactionWithCategory[];
  prefs: DisplayPrefs;
  today: IsoDate;
  limit?: number;
}) {
  const [filter, setFilter] = React.useState<"all" | "income" | "expense">("all");
  const rows = transactions.filter((t) => filter === "all" || t.transaction_type === filter).slice(0, limit);

  return (
    <div className="flex flex-col gap-3">
      <FilterChips
        label="Show"
        options={[
          { value: "all", label: "All" },
          { value: "income", label: "Income" },
          { value: "expense", label: "Expenses" },
        ]}
        value={filter}
        onValueChange={setFilter}
      />
      {rows.length === 0 ? (
        <p className="rounded-md bg-surface p-4 text-center text-body text-fg-muted">
          No recent {filter === "income" ? "income" : "expenses"}.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((t) => (
            <li key={t.id}>
              <TransactionRow transaction={t} prefs={prefs} today={today} showDate />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
