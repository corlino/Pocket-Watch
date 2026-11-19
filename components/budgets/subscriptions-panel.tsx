"use client";

import * as React from "react";
import { Plus, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryIcon } from "@/components/categories/category-icon";
import { ScheduleForm } from "@/components/transactions/schedule-form";
import { SubscriptionForm } from "./subscription-form";
import type { SubscriptionRow } from "@/features/budgets/queries";
import type { Category, DisplayPrefs, ScheduleSummary } from "@/features/transactions/types";
import { monthlyEquivalent } from "@/lib/calculations";
import type { IsoDate } from "@/lib/dates/date-only";
import { formatDate } from "@/lib/formatting";
import { formatMoney, sumMoney } from "@/lib/money";
import { figureSizeLg } from "@/components/financial/fit-text";
import { cn } from "@/lib/utils";

/**
 * Subscriptions tab (component spec F-13, §7.5). Subscriptions are manual:
 * nothing is synced with providers — the copy says so.
 */
export function SubscriptionsPanel({
  subscriptions,
  categories,
  prefs,
  today,
}: {
  subscriptions: SubscriptionRow[];
  categories: Category[];
  prefs: DisplayPrefs;
  today: IsoDate;
}) {
  const [mode, setMode] = React.useState<{ kind: "create" } | { kind: "edit"; sub: SubscriptionRow } | null>(null);
  const fmt = (v: Parameters<typeof formatMoney>[0]) => formatMoney(v, { currency: prefs.currency, numberFormat: prefs.numberFormat });
  const monthlyTotal = sumMoney(subscriptions.map((s) => monthlyEquivalent(s.amount, s.recurrence_interval)));
  const expenseCategories = categories.filter((c) => c.category_type === "expense" && !c.is_archived);

  return (
    <section aria-labelledby="subs-heading">
      <SectionHeader
        id="subs-heading"
        title="Active Subscriptions"
        action={
          <Button size="sm" onClick={() => setMode({ kind: "create" })}>
            <Plus aria-hidden />
            Add
          </Button>
        }
      />
      {subscriptions.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            icon={Repeat}
            title="No subscriptions added yet."
            description="Add the services you pay for regularly. Charges are recorded automatically on each renewal date."
            action={
              <Button onClick={() => setMode({ kind: "create" })}>
                <Plus aria-hidden />
                Add Subscription
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {subscriptions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setMode({ kind: "edit", sub: s })}
                  aria-label={`${s.description ?? s.category.name}, ${fmt(s.amount)} ${s.recurrence_interval}, next ${formatDate(s.next_scheduled_date, prefs.dateFormat)}. Edit`}
                  className="flex min-h-16 w-full items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <CategoryIcon icon={s.icon ?? s.category.icon} color={s.category.color} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium text-fg">{s.description || s.category.name}</span>
                    <span className="block truncate text-caption text-fg-muted">Next: {formatDate(s.next_scheduled_date, prefs.dateFormat)}</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="money text-body font-semibold text-fg">{fmt(s.amount)}</span>
                    <span className="text-caption text-fg-muted">{s.recurrence_interval === "weekly" ? "Weekly" : "Monthly"}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <dl className="mt-3 grid grid-cols-2 gap-3 rounded-lg [&>div]:min-w-0 border border-border bg-surface-secondary p-4">
            <div>
              <dt className="text-caption text-fg-muted">Total monthly cost</dt>
              <dd className={cn("money font-semibold text-fg", figureSizeLg(fmt(monthlyTotal)))}>{fmt(monthlyTotal)}</dd>
            </div>
            <div className="text-right">
              <dt className="text-caption text-fg-muted">Projected yearly cost</dt>
              <dd className={cn("money font-semibold text-fg", figureSizeLg(fmt(monthlyTotal.times(12))))}>{fmt(monthlyTotal.times(12))}</dd>
            </div>
          </dl>
          <p className="mt-2 px-1 text-caption text-fg-muted">Tracked manually — Pocket Watch doesn&apos;t connect to or charge any provider.</p>
        </>
      )}

      <Sheet open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        {mode && (
          <SheetContent title={mode.kind === "create" ? "Add Subscription" : "Edit Subscription"} key={mode.kind === "create" ? "create" : mode.sub.id}>
            {mode.kind === "create" ? (
              <SubscriptionForm categories={expenseCategories} prefs={prefs} today={today} onDone={() => setMode(null)} />
            ) : (
              <ScheduleForm
                schedule={{ ...mode.sub, amount: mode.sub.amount as ScheduleSummary["amount"], is_active: true }}
                type="expense"
                categories={categories}
                prefs={prefs}
                onDone={() => setMode(null)}
              />
            )}
          </SheetContent>
        )}
      </Sheet>
    </section>
  );
}
