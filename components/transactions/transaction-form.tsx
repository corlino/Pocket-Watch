"use client";

import * as React from "react";
import { Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateInput } from "@/components/ui/date-input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { CategorySelectionGrid } from "@/components/categories/category-selection-grid";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { createTransaction, deleteTransaction, disableSchedule, updateTransaction } from "@/features/transactions/actions";
import { DESCRIPTION_MAX } from "@/features/transactions/schema";
import type { Category, DisplayPrefs, TransactionType, TransactionWithCategory } from "@/features/transactions/types";
import { anchorDayFor, nextOccurrence, type RecurrenceInterval } from "@/lib/dates/recurrence";
import { isIsoDate, type IsoDate } from "@/lib/dates/date-only";
import { currencySymbol, parseAmountInput } from "@/lib/money";
import { formatDate } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import { useDesktopAutoFocus } from "@/hooks/use-desktop-autofocus";

type Errors = Partial<Record<string, string>>;

/**
 * FR-02 Transaction Form — create, or edit a single transaction.
 * Values are preserved on any error; the server re-validates everything.
 */
export function TransactionForm({
  categories,
  prefs,
  today,
  transaction,
  onDone,
  onEditSchedule,
}: {
  categories: Category[];
  prefs: DisplayPrefs;
  today: IsoDate;
  transaction?: TransactionWithCategory;
  onDone: () => void;
  onEditSchedule?: () => void;
}) {
  const editing = Boolean(transaction);
  const [type, setType] = React.useState<TransactionType>(transaction?.transaction_type ?? "expense");
  const [amount, setAmount] = React.useState<string>(transaction?.amount ?? "");
  const [description, setDescription] = React.useState(transaction?.description ?? "");
  const [date, setDate] = React.useState<string>(transaction?.transaction_date ?? today);
  const [categoryId, setCategoryId] = React.useState(transaction?.category.id ?? "");
  const [notes, setNotes] = React.useState(transaction?.notes ?? "");
  const [showNotes, setShowNotes] = React.useState(Boolean(transaction?.notes));
  const [recurring, setRecurring] = React.useState(false);
  const [interval, setInterval] = React.useState<RecurrenceInterval>("monthly");
  const [errors, setErrors] = React.useState<Errors>({});
  const amountRef = useDesktopAutoFocus<HTMLInputElement>(!editing);
  const [pending, startTransition] = React.useTransition();
  const [confirm, setConfirm] = React.useState<"delete" | "stop" | null>(null);

  // Only active categories of the selected type — plus the current one when editing.
  const currentCategoryId = transaction?.category.id;
  const options = categories.filter((c) => c.category_type === type && (!c.is_archived || c.id === currentCategoryId));

  const changeType = (next: TransactionType) => {
    setType(next);
    if (!categories.some((c) => c.id === categoryId && c.category_type === next)) setCategoryId("");
    setErrors((e) => ({ ...e, categoryId: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const parsed = parseAmountInput(amount);
    if (!parsed.ok) e.amount = parsed.error;
    if (!isIsoDate(date)) e.date = "Choose a valid date.";
    if (!categoryId) e.categoryId = "Choose a category.";
    if (description.length > DESCRIPTION_MAX) e.description = `Description can be up to ${DESCRIPTION_MAX} characters.`;
    return e;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      // Move focus to the first invalid control once errors render.
      const form = event.currentTarget as HTMLFormElement;
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"], [aria-invalid="true"] [role="radio"]')?.focus());
      return;
    }

    const input = { type, categoryId, amount, date, description, notes: showNotes ? notes : "", recurring: !editing && recurring, interval: recurring ? interval : undefined };
    startTransition(async () => {
      const result = editing ? await updateTransaction(transaction!.id, input) : await createTransaction(input);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Transaction updated" : recurring ? "Recurring transaction added" : "Transaction added");
      onDone();
    });
  };

  const runConfirmed = () => {
    if (!transaction) return;
    startTransition(async () => {
      const result =
        confirm === "delete" ? await deleteTransaction(transaction.id) : await disableSchedule(transaction.recurring_schedule_id!);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(confirm === "delete" ? "Transaction deleted" : "Recurring schedule stopped");
      setConfirm(null);
      if (confirm === "delete") onDone();
    });
  };

  const nextPreview =
    recurring && isIsoDate(date) ? nextOccurrence(interval, anchorDayFor(interval, date as IsoDate), date as IsoDate) : null;
  const schedule = transaction?.schedule;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <SegmentedControl
        aria-label="Transaction type"
        options={[
          { value: "expense", label: "Expense" },
          { value: "income", label: "Income" },
        ]}
        value={type}
        onValueChange={changeType}
      />

      <Field label="Amount" id="tx-amount" error={errors.amount}>
        <CurrencyInput symbol={currencySymbol(prefs.currency)} value={amount} onValueChange={setAmount} ref={amountRef} />
      </Field>

      <Field
        label="Description"
        id="tx-description"
        error={errors.description}
        aside={
          <span className={cn("text-caption text-fg-muted", description.length > DESCRIPTION_MAX && "text-expense")} aria-hidden>
            {description.length}/{DESCRIPTION_MAX}
          </span>
        }
      >
        <Input
          value={description}
          maxLength={DESCRIPTION_MAX}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe transaction"
          autoComplete="off"
        />
      </Field>

      <Field label="Date" id="tx-date" error={errors.date}>
        <DateInput value={date} onChange={(e) => setDate(e.target.value)} required />
      </Field>

      <FieldGroup label="Category" error={errors.categoryId}>
        {options.length ? (
          <CategorySelectionGrid categories={options} value={categoryId} onValueChange={setCategoryId} label="Category" invalid={Boolean(errors.categoryId)} />
        ) : (
          <p className="rounded-md bg-surface p-3 text-body text-fg-muted">No active {type} categories. Add one in Profile → Categories.</p>
        )}
      </FieldGroup>

      {showNotes ? (
        <Field label="Notes" id="tx-notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={3} />
        </Field>
      ) : (
        <Button type="button" variant="link" className="self-start" onClick={() => setShowNotes(true)}>
          + Add a note
        </Button>
      )}

      {!editing && (
        <div className="rounded-md border border-border bg-surface p-3">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="flex items-center gap-2.5">
              <Repeat className="size-[18px] text-fg-muted" aria-hidden />
              <span>
                <span className="block text-body font-medium text-fg">Recurring</span>
                <span className="block text-caption text-fg-muted">Repeat this transaction automatically</span>
              </span>
            </span>
            <Switch checked={recurring} onCheckedChange={setRecurring} aria-label="Recurring" />
          </label>
          {recurring && (
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <SegmentedControl
                size="sm"
                aria-label="Repeats"
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                ]}
                value={interval}
                onValueChange={setInterval}
              />
              <p className="text-caption text-fg-secondary">
                This one is saved now. The next will be added automatically
                {nextPreview ? ` on ${formatDate(nextPreview, prefs.dateFormat)}` : ""}, then every{" "}
                {interval === "weekly" ? "week" : "month"} until you stop it.
              </p>
            </div>
          )}
        </div>
      )}

      {editing && schedule && (
        <div className="rounded-md border border-border bg-surface p-3 text-caption text-fg-secondary">
          <p className="flex items-center gap-2 font-medium text-fg">
            <Repeat className="size-4" aria-hidden />
            Part of a {schedule.recurrence_interval} recurring schedule
            {!schedule.is_active && <span className="text-fg-muted">(stopped)</span>}
          </p>
          <p className="mt-1">Changes here affect only this transaction.</p>
          {schedule.is_active && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={onEditSchedule}>
                Edit recurring schedule
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirm("stop")}>
                Stop recurring
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 mt-1 flex flex-col gap-2 bg-background-elevated px-4 pt-2 md:static md:mx-0 md:px-0">
        <Button type="submit" size="lg" block loading={pending}>
          {editing ? "Save Changes" : "Add Transaction"}
        </Button>
        {editing && (
          <Button type="button" variant="destructive" block onClick={() => setConfirm("delete")}>
            <Trash2 aria-hidden />
            Delete Transaction
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === "delete" ? "Delete this transaction?" : "Stop this recurring schedule?"}
        description={
          confirm === "delete"
            ? schedule?.is_active
              ? "This removes only this transaction. Its recurring schedule will keep adding future transactions."
              : "This permanently removes the transaction."
            : "No more transactions will be added automatically. Transactions already recorded stay in your history."
        }
        confirmLabel={confirm === "delete" ? "Delete" : "Stop recurring"}
        onConfirm={runConfirmed}
        pending={pending}
      />
    </form>
  );
}
