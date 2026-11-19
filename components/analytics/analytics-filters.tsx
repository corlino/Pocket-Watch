"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Field } from "@/components/ui/field";
import { FilterChips } from "@/components/ui/filter-chip";
import { controlClasses } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Category } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
  { value: "ytd", label: "This year to date" },
  { value: "month", label: "A month" },
  { value: "year", label: "A year" },
  { value: "custom", label: "Custom range" },
];

/**
 * Analytics filters (FR-AN-006): one row above the charts. Period and type
 * are always visible; category and date pickers sit in an expandable panel.
 * Every change updates the URL, and all sections re-render from it.
 */
export function AnalyticsFilters({ categories, currentYear, currentMonth }: { categories: Category[]; currentYear: number; currentMonth: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  const range = params.get("range") ?? "6m";
  const type = (params.get("type") as "income" | "expense" | null) ?? "all";
  const category = params.get("category") ?? "all";
  const needsMore = range === "month" || range === "year" || range === "custom";
  const [open, setOpen] = React.useState(needsMore || category !== "all");
  const activeCount = [category !== "all", type !== "all", range !== "6m"].filter(Boolean).length;
  const years = Array.from({ length: 8 }, (_, i) => String(currentYear - i));

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const setRange = (v: string) => {
    const changes: Record<string, string | null> = { range: v === "6m" ? null : v, month: null, year: null, from: null, to: null };
    if (v === "month") changes.month = currentMonth;
    if (v === "year") changes.year = String(currentYear);
    if (v === "month" || v === "year" || v === "custom") setOpen(true);
    update(changes);
  };

  return (
    <section aria-label="Analytics filters" aria-busy={pending || undefined} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Select value={range} onValueChange={setRange} options={PERIOD_OPTIONS} aria-label="Period" />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="analytics-more-filters"
          className="relative px-3"
        >
          <SlidersHorizontal aria-hidden />
          <span className="sr-only sm:not-sr-only">Filters</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-brand text-overline font-semibold text-fg-inverse">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <FilterChips
        label="Transaction type"
        options={[
          { value: "all", label: "All" },
          { value: "income", label: "Income" },
          { value: "expense", label: "Expenses" },
        ]}
        value={type}
        onValueChange={(v) => update({ type: v === "all" ? null : v, category: null })}
      />

      {open && (
        <div id="analytics-more-filters" className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-4">
          {range === "month" && (
            <Field label="Month" id="an-month">
              <input
                type="month"
                value={params.get("month") ?? currentMonth}
                onChange={(e) => e.target.value && update({ month: e.target.value })}
                className={cn(controlClasses, "h-11")}
              />
            </Field>
          )}
          {range === "year" && (
            <Field label="Year" id="an-year">
              <Select value={params.get("year") ?? String(currentYear)} onValueChange={(v) => update({ year: v })} options={years.map((y) => ({ value: y, label: y }))} />
            </Field>
          )}
          {range === "custom" && (
            <>
              <Field label="From" id="an-from">
                <DateInput value={params.get("from") ?? ""} onChange={(e) => update({ from: e.target.value || null })} />
              </Field>
              <Field label="To" id="an-to">
                <DateInput value={params.get("to") ?? ""} onChange={(e) => update({ to: e.target.value || null })} />
              </Field>
            </>
          )}
          <Field label="Category" id="an-category">
            <Select
              value={category}
              onValueChange={(v) => update({ category: v === "all" ? null : v })}
              options={[
                { value: "all", label: "All categories" },
                ...categories
                  .filter((c) => type === "all" || c.category_type === type)
                  .map((c) => ({ value: c.id, label: `${c.name}${type === "all" ? (c.category_type === "income" ? " (income)" : "") : ""}${c.is_archived ? " (archived)" : ""}` })),
              ]}
            />
          </Field>
          {activeCount > 0 && (
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  startTransition(() => router.replace(pathname, { scroll: false }));
                }}
              >
                <RotateCcw aria-hidden />
                Reset filters
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
