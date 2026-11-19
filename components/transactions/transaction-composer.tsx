"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useComposer } from "./composer-context";
import { TransactionForm } from "./transaction-form";
import { ScheduleForm } from "./schedule-form";
import type { Category, DisplayPrefs } from "@/features/transactions/types";
import type { IsoDate } from "@/lib/dates/date-only";

/** The single Add / Edit Transaction sheet, driven by ComposerContext. */
export function TransactionComposer({ categories, prefs, today }: { categories: Category[]; prefs: DisplayPrefs; today: IsoDate }) {
  const { mode, close, openSchedule } = useComposer();
  const title =
    mode?.kind === "edit" ? "Edit Transaction" : mode?.kind === "schedule" ? "Edit Recurring Schedule" : "Add Transaction";
  const key = mode ? (mode.kind === "create" ? "create" : `${mode.kind}-${mode.transaction.id}`) : "closed";

  return (
    <Sheet open={mode !== null} onOpenChange={(open) => !open && close()}>
      {mode && (
        <SheetContent title={title} key={key}>
          {mode.kind === "schedule" && mode.transaction.schedule ? (
            <ScheduleForm
              schedule={mode.transaction.schedule}
              type={mode.transaction.transaction_type}
              categories={categories}
              prefs={prefs}
              onDone={close}
            />
          ) : (
            <TransactionForm
              categories={categories}
              prefs={prefs}
              today={today}
              transaction={mode.kind === "edit" ? mode.transaction : undefined}
              onDone={close}
              onEditSchedule={mode.kind === "edit" ? () => openSchedule(mode.transaction) : undefined}
            />
          )}
        </SheetContent>
      )}
    </Sheet>
  );
}
