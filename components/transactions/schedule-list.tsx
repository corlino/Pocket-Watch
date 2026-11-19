"use client";

import * as React from "react";
import { Pencil, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryIcon } from "@/components/categories/category-icon";
import { ScheduleForm } from "./schedule-form";
import type { ScheduleWithCategory } from "@/features/transactions/queries";
import type { Category, DisplayPrefs } from "@/features/transactions/types";
import { formatTransactionAmount } from "@/lib/money";
import { formatDate } from "@/lib/formatting";
import { cn } from "@/lib/utils";

/** All recurring schedules with edit / stop (PRD FR-TRANS-015, FR-TRANS-016). */
export function ScheduleList({
  schedules,
  categories,
  prefs,
}: {
  schedules: ScheduleWithCategory[];
  categories: Category[];
  prefs: DisplayPrefs;
}) {
  const [editing, setEditing] = React.useState<ScheduleWithCategory | null>(null);
  const active = schedules.filter((s) => s.is_active);
  const stopped = schedules.filter((s) => !s.is_active);

  if (!schedules.length) {
    return (
      <EmptyState
        icon={Repeat}
        title="No recurring transactions"
        description="Turn on “Recurring” when you add a transaction and it will be repeated automatically."
      />
    );
  }

  const row = (s: ScheduleWithCategory) => (
    <li key={s.id} className={cn("flex min-h-16 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2", !s.is_active && "opacity-70")}>
      <CategoryIcon icon={s.category.icon} color={s.category.color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-fg">{s.description || s.category.name}</p>
        <p className="truncate text-caption text-fg-muted">
          {s.is_active ? `Next ${formatDate(s.next_scheduled_date, prefs.dateFormat)}` : "Stopped"} ·{" "}
          {s.recurrence_interval === "weekly" ? "Weekly" : "Monthly"} · {s.category.name}
        </p>
      </div>
      <span className={cn("money text-body font-semibold", s.transaction_type === "income" ? "text-income" : "text-expense")}>
        {formatTransactionAmount(s.amount, s.transaction_type, { currency: prefs.currency, numberFormat: prefs.numberFormat })}
      </span>
      {s.is_active && (
        <Button variant="ghost" size="icon" onClick={() => setEditing(s)} aria-label={`Edit ${s.description || s.category.name} schedule`}>
          <Pencil aria-hidden />
        </Button>
      )}
    </li>
  );

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="active-schedules">
        <h2 id="active-schedules" className="mb-2 px-1 text-caption font-semibold tracking-wide text-fg-secondary uppercase">
          Active ({active.length})
        </h2>
        {active.length ? (
          <ul className="flex flex-col gap-2">{active.map(row)}</ul>
        ) : (
          <p className="rounded-lg bg-surface p-4 text-center text-body text-fg-muted">No active recurring transactions.</p>
        )}
      </section>
      {stopped.length > 0 && (
        <section aria-labelledby="stopped-schedules">
          <h2 id="stopped-schedules" className="mb-2 px-1 text-caption font-semibold tracking-wide text-fg-secondary uppercase">
            Stopped ({stopped.length})
          </h2>
          <ul className="flex flex-col gap-2">{stopped.map(row)}</ul>
        </section>
      )}

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <SheetContent title="Edit Recurring Schedule" key={editing.id}>
            <ScheduleForm schedule={editing} type={editing.transaction_type} categories={categories} prefs={prefs} onDone={() => setEditing(null)} />
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
