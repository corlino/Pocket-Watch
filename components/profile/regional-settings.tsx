"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { updatePreferences } from "@/features/preferences/actions";
import type { DisplayPrefs } from "@/features/transactions/types";
import { formatDate, type DateFormat } from "@/lib/formatting";
import { NUMBER_FORMAT_LABELS, formatMoney, type Currency, type NumberFormat } from "@/lib/money";
import type { IsoDate } from "@/lib/dates/date-only";

const CURRENCY_NAMES: Record<Currency, string> = {
  CAD: "Canadian dollar (CAD, $)",
  USD: "US dollar (USD, $)",
  EUR: "Euro (EUR, €)",
  GBP: "British pound (GBP, £)",
};

/**
 * FR-PRO-003/004: display currency, date format and number format. Changes
 * apply everywhere immediately; stored amounts are never converted.
 */
export function RegionalSettings({ initial, today }: { initial: DisplayPrefs; today: IsoDate }) {
  const [prefs, setPrefs] = React.useState(initial);
  const [, startTransition] = React.useTransition();

  const save = <K extends keyof DisplayPrefs>(key: K, value: DisplayPrefs[K]) => {
    const previous = prefs;
    setPrefs({ ...prefs, [key]: value });
    startTransition(async () => {
      const r = await updatePreferences({ [key]: value });
      if (!r.ok) {
        setPrefs(previous);
        toast.error(r.error);
        return;
      }
      toast.success("Preference saved");
    });
  };

  const sample = formatMoney("1234.56", { currency: prefs.currency, numberFormat: prefs.numberFormat });
  const sampleNeg = formatMoney("-348.52", { currency: prefs.currency, numberFormat: prefs.numberFormat });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-surface-secondary p-4" aria-live="polite">
        <p className="text-caption text-fg-muted">Preview</p>
        <p className="money mt-1 text-h3 font-semibold text-fg">{sample}</p>
        <p className="money text-body text-fg-secondary">
          {sampleNeg} · {formatDate(today, prefs.dateFormat)}
        </p>
      </div>

      <Field label="Display currency" id="pref-currency">
        <Select
          value={prefs.currency}
          onValueChange={(v) => save("currency", v as Currency)}
          options={(Object.keys(CURRENCY_NAMES) as Currency[]).map((c) => ({ value: c, label: CURRENCY_NAMES[c] }))}
        />
      </Field>
      <p className="-mt-2 flex gap-2 text-caption text-fg-secondary">
        <Info className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
        Changes the symbol only — amounts are never converted. Convert foreign purchases yourself before recording them.
      </p>

      <Field label="Date format" id="pref-date">
        <Select
          value={prefs.dateFormat}
          onValueChange={(v) => save("dateFormat", v as DateFormat)}
          options={(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as DateFormat[]).map((f) => ({ value: f, label: `${f} (${formatDate(today, f)})` }))}
        />
      </Field>

      <Field label="Number format" id="pref-number">
        <Select
          value={prefs.numberFormat}
          onValueChange={(v) => save("numberFormat", v as NumberFormat)}
          options={(Object.keys(NUMBER_FORMAT_LABELS) as NumberFormat[]).map((f) => ({ value: f, label: NUMBER_FORMAT_LABELS[f] }))}
        />
      </Field>
      <p className="-mt-2 text-caption text-fg-muted">Date pickers use your phone&apos;s own format; everything else follows these settings.</p>
    </div>
  );
}
