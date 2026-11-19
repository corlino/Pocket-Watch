"use client";

import * as React from "react";
import Link from "next/link";
import { ListFilter, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Field, FieldGroup } from "@/components/ui/field";
import { CategorySelectionGrid } from "@/components/categories/category-selection-grid";
import { CategoryIcon } from "@/components/categories/category-icon";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { createBudget, deleteBudget, updateBudget } from "@/features/budgets/actions";
import type { Category, DisplayPrefs } from "@/features/transactions/types";
import { currencySymbol, parseAmountInput } from "@/lib/money";

/** FR-04 Add Budget Category form; also edits/deletes an allocation. */
export function BudgetForm({
  mode,
  periodType,
  periodIdentifier,
  periodLabel,
  categories,
  prefs,
  onDone,
  transactionsHref,
}: {
  mode: { kind: "create" } | { kind: "edit"; id: string; amount: string; category: Pick<Category, "id" | "name" | "icon" | "color"> };
  periodType: "monthly" | "yearly";
  periodIdentifier: string;
  periodLabel: string;
  categories: Category[];
  prefs: DisplayPrefs;
  onDone: () => void;
  transactionsHref?: string;
}) {
  const editing = mode.kind === "edit";
  const [categoryId, setCategoryId] = React.useState(editing ? mode.category.id : "");
  const [amount, setAmount] = React.useState<string>(editing ? mode.amount : "");
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!editing && !categoryId) errs.categoryId = "Choose a category.";
    const parsed = parseAmountInput(amount, { allowZero: true });
    if (!parsed.ok) errs.amount = parsed.error;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    startTransition(async () => {
      const result = editing
        ? await updateBudget(mode.id, amount)
        : await createBudget({ categoryId, amount, periodType, periodIdentifier });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Budget updated" : "Budget created");
      onDone();
    });
  };

  const remove = () =>
    startTransition(async () => {
      if (!editing) return;
      const result = await deleteBudget(mode.id);
      if (!result.ok) return void toast.error(result.error);
      toast.success("Budget removed");
      setConfirmDelete(false);
      onDone();
    });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <p className="rounded-md bg-surface p-3 text-caption text-fg-secondary">
        {periodType === "monthly" ? "Monthly" : "Yearly"} budget for <strong className="text-fg">{periodLabel}</strong>. Each{" "}
        {periodType === "monthly" ? "month" : "year"} is set separately{periodType === "monthly" ? " and doesn't carry forward" : ""}.
      </p>

      {editing ? (
        <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
          <CategoryIcon icon={mode.category.icon} color={mode.category.color} />
          <p className="text-body font-medium text-fg">{mode.category.name}</p>
        </div>
      ) : (
        <FieldGroup label="Category" error={errors.categoryId}>
          {categories.length ? (
            <CategorySelectionGrid categories={categories} value={categoryId} onValueChange={setCategoryId} label="Category" invalid={Boolean(errors.categoryId)} />
          ) : (
            <p className="rounded-md bg-surface p-3 text-body text-fg-muted">Every active expense category already has a budget for this period.</p>
          )}
        </FieldGroup>
      )}

      <Field label={periodType === "monthly" ? "Monthly budget" : "Yearly budget"} id="budget-amount" error={errors.amount} hint="Zero is allowed.">
        <CurrencyInput symbol={currencySymbol(prefs.currency)} value={amount} onValueChange={setAmount} autoFocus={editing} />
      </Field>

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" block loading={pending} disabled={!editing && !categories.length}>
          {editing ? "Save Budget" : "Add Budget Category"}
        </Button>
        {editing && transactionsHref && (
          <Button asChild variant="secondary" block>
            <Link href={transactionsHref} onClick={onDone}>
              <ListFilter aria-hidden />
              View transactions
            </Link>
          </Button>
        )}
        {editing && (
          <Button type="button" variant="destructive" block onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden />
            Remove Budget
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remove this budget?"
        description="Only the allocation is removed. The category and all its transactions stay as they are."
        confirmLabel="Remove"
        onConfirm={remove}
        pending={pending}
      />
    </form>
  );
}
