"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { CategorySelectionGrid } from "@/components/categories/category-selection-grid";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { disableSchedule, updateSchedule } from "@/features/transactions/actions";
import { DESCRIPTION_MAX } from "@/features/transactions/schema";
import type { Category, DisplayPrefs, ScheduleSummary } from "@/features/transactions/types";
import type { RecurrenceInterval } from "@/lib/dates/recurrence";
import { currencySymbol, parseAmountInput } from "@/lib/money";
import { formatDate } from "@/lib/formatting";

/** Edit a recurring schedule — affects future transactions only (FR-TRANS-016). */
export function ScheduleForm({
  schedule,
  type,
  categories,
  prefs,
  onDone,
}: {
  schedule: ScheduleSummary;
  type: "income" | "expense";
  categories: Category[];
  prefs: DisplayPrefs;
  onDone: () => void;
}) {
  const [amount, setAmount] = React.useState<string>(schedule.amount);
  const [description, setDescription] = React.useState(schedule.description ?? "");
  const [notes, setNotes] = React.useState(schedule.notes ?? "");
  const [categoryId, setCategoryId] = React.useState(schedule.category_id);
  const [interval, setInterval] = React.useState<RecurrenceInterval>(schedule.recurrence_interval);
  const [isSubscription, setIsSubscription] = React.useState(schedule.is_subscription);
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});
  const [confirmStop, setConfirmStop] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const options = categories.filter((c) => c.category_type === type && (!c.is_archived || c.id === schedule.category_id));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAmountInput(amount);
    if (!parsed.ok) return setErrors({ amount: parsed.error });
    startTransition(async () => {
      const result = await updateSchedule({ scheduleId: schedule.id, amount, description, notes, categoryId, interval, isSubscription });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success("Recurring schedule updated");
      onDone();
    });
  };

  const stop = () =>
    startTransition(async () => {
      const result = await disableSchedule(schedule.id);
      if (!result.ok) return void toast.error(result.error);
      toast.success("Recurring schedule stopped");
      setConfirmStop(false);
      onDone();
    });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <p className="rounded-md bg-surface p-3 text-caption text-fg-secondary">
        Changes apply from the next transaction on <strong className="text-fg">{formatDate(schedule.next_scheduled_date, prefs.dateFormat)}</strong>.
        Transactions already recorded won&apos;t change.
      </p>
      <Field label="Amount" id="sched-amount" error={errors.amount}>
        <CurrencyInput symbol={currencySymbol(prefs.currency)} value={amount} onValueChange={setAmount} />
      </Field>
      <Field label="Description" id="sched-description" error={errors.description}>
        <Input value={description} maxLength={DESCRIPTION_MAX} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <FieldGroup label="Repeats">
        <SegmentedControl
          aria-label="Repeats"
          options={[
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ]}
          value={interval}
          onValueChange={setInterval}
        />
      </FieldGroup>
      {type === "expense" && (
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-surface p-3">
          <span>
            <span className="block text-body font-medium text-fg">Subscription</span>
            <span className="block text-caption text-fg-muted">Show it under Budget → Subscriptions</span>
          </span>
          <Switch checked={isSubscription} onCheckedChange={setIsSubscription} aria-label="Subscription" />
        </label>
      )}
      <FieldGroup label="Category" error={errors.categoryId}>
        <CategorySelectionGrid categories={options} value={categoryId} onValueChange={setCategoryId} label="Category" />
      </FieldGroup>
      <Field label="Notes" id="sched-notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={2} />
      </Field>
      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" block loading={pending}>
          Save Schedule
        </Button>
        <Button type="button" variant="destructive" block onClick={() => setConfirmStop(true)}>
          Stop Recurring
        </Button>
      </div>
      <ConfirmDialog
        open={confirmStop}
        onOpenChange={setConfirmStop}
        title="Stop this recurring schedule?"
        description="No more transactions will be added automatically. Transactions already recorded stay in your history."
        confirmLabel="Stop recurring"
        onConfirm={stop}
        pending={pending}
      />
    </form>
  );
}
