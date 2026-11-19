"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateInput } from "@/components/ui/date-input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IconSelectionGrid } from "@/components/forms/icon-selection-grid";
import { createSubscription } from "@/features/budgets/actions";
import type { Category, DisplayPrefs } from "@/features/transactions/types";
import { monthlyEquivalent } from "@/lib/calculations";
import { isIsoDate, type IsoDate } from "@/lib/dates/date-only";
import { CATEGORY_TILE } from "@/lib/categories";
import { currencySymbol, formatMoney, parseAmountInput } from "@/lib/money";

/** FR-05 Add Subscription. Renewal date = next charge; recorded automatically then. */
export function SubscriptionForm({
  categories,
  prefs,
  today,
  onDone,
}: {
  categories: Category[];
  prefs: DisplayPrefs;
  today: IsoDate;
  onDone: () => void;
}) {
  const defaultCategory = categories.find((c) => c.name === "Subscriptions")?.id ?? "";
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState(defaultCategory);
  const [amount, setAmount] = React.useState("");
  const [interval, setInterval] = React.useState<"weekly" | "monthly">("monthly");
  const [renewal, setRenewal] = React.useState<string>(today);
  const [icon, setIcon] = React.useState("repeat");
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});
  const [pending, startTransition] = React.useTransition();

  const parsed = parseAmountInput(amount);
  const monthly = parsed.ok ? monthlyEquivalent(parsed.value, interval) : null;
  const category = categories.find((c) => c.id === categoryId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Enter a name.";
    if (!categoryId) errs.categoryId = "Choose a category.";
    if (!parsed.ok) errs.amount = parsed.error;
    if (!isIsoDate(renewal)) errs.renewalDate = "Choose a valid date.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    startTransition(async () => {
      const result = await createSubscription({ name, categoryId, amount, interval, renewalDate: renewal, icon });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success("Subscription saved");
      onDone();
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Subscription name" id="sub-name" error={errors.name} aside={<span className="text-caption text-fg-muted" aria-hidden>{name.length}/100</span>}>
        <Input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix" autoComplete="off" autoFocus />
      </Field>
      <Field label="Category" id="sub-category" error={errors.categoryId}>
        <Select value={categoryId} onValueChange={setCategoryId} placeholder="Select category" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount" id="sub-amount" error={errors.amount}>
          <CurrencyInput symbol={currencySymbol(prefs.currency)} value={amount} onValueChange={setAmount} />
        </Field>
        <Field label="Billing cycle" id="sub-cycle">
          <Select
            value={interval}
            onValueChange={(v) => setInterval(v as "weekly" | "monthly")}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "weekly", label: "Weekly" },
            ]}
          />
        </Field>
      </div>
      <Field label="Next renewal date" id="sub-renewal" error={errors.renewalDate} hint="The charge is added automatically on this date, then every cycle.">
        <DateInput value={renewal} onChange={(e) => setRenewal(e.target.value)} />
      </Field>
      {monthly && interval === "weekly" && (
        <p className="text-caption text-fg-secondary">
          About <span className="money font-semibold text-fg">{formatMoney(monthly, { currency: prefs.currency, numberFormat: prefs.numberFormat })}</span> per month.
        </p>
      )}
      <FieldGroup label="Icon">
        <IconSelectionGrid value={icon} onValueChange={setIcon} tileClass={CATEGORY_TILE[(category?.color as keyof typeof CATEGORY_TILE) ?? "cyan"] ?? CATEGORY_TILE.cyan} />
      </FieldGroup>
      <Button type="submit" size="lg" block loading={pending}>
        Add Subscription
      </Button>
    </form>
  );
}
