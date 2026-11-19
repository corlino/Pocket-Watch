"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chip";
import { DateInput } from "@/components/ui/date-input";
import { Field } from "@/components/ui/field";
import { Input, controlClasses } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Category } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

type Period = "all" | "month" | "year" | "range";

/**
 * FR-TRANS-009 search & filters: description, category, type, date range,
 * month, year. State lives in the URL so it survives refresh and back/forward.
 */
export function TransactionFilters({ categories, currentYear }: { categories: Category[]; currentYear: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const initialPeriod: Period = params.get("from") || params.get("to") ? "range" : params.get("month") ? "month" : params.get("year") ? "year" : "all";
  const [q, setQ] = React.useState(params.get("q") ?? "");
  const [period, setPeriod] = React.useState<Period>(initialPeriod);
  const [showMore, setShowMore] = React.useState(initialPeriod !== "all" || Boolean(params.get("category")));

  const update = React.useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(changes)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      next.delete("limit");
      startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
    },
    [params, pathname, router],
  );

  // Debounce search typing.
  React.useEffect(() => {
    if ((params.get("q") ?? "") === q) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 300);
    return () => clearTimeout(t);
  }, [q, params, update]);

  const type = (params.get("type") as "income" | "expense" | null) ?? "all";
  const category = params.get("category") ?? "all";
  const activeCount = ["category", "month", "year", "from", "to"].filter((k) => params.get(k)).length;
  const years = Array.from({ length: 8 }, (_, i) => String(currentYear + 1 - i));

  const setPeriodMode = (p: Period) => {
    setPeriod(p);
    if (p === "all") update({ month: null, year: null, from: null, to: null });
    if (p === "month") update({ year: null, from: null, to: null });
    if (p === "year") update({ month: null, from: null, to: null });
    if (p === "range") update({ month: null, year: null });
  };

  return (
    <div className="flex flex-col gap-3" aria-busy={isPending || undefined}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-fg-muted" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search descriptions"
            aria-label="Search transactions by description"
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowMore((s) => !s)}
          aria-expanded={showMore}
          aria-controls="more-filters"
          className="relative px-3"
        >
          <SlidersHorizontal aria-hidden />
          <span className="sr-only md:not-sr-only">Filters</span>
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

      {showMore && (
        <div id="more-filters" className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Category" id="filter-category">
            <Select
              value={category}
              onValueChange={(v) => update({ category: v === "all" ? null : v })}
              options={[
                { value: "all", label: "All categories" },
                ...categories
                  .filter((c) => type === "all" || c.category_type === type)
                  .map((c) => ({ value: c.id, label: `${c.name}${c.is_archived ? " (archived)" : ""}` })),
              ]}
            />
          </Field>
          <Field label="Period" id="filter-period">
            <Select
              value={period}
              onValueChange={(v) => setPeriodMode(v as Period)}
              options={[
                { value: "all", label: "All time" },
                { value: "month", label: "Month" },
                { value: "year", label: "Year" },
                { value: "range", label: "Date range" },
              ]}
            />
          </Field>
          {period === "month" && (
            <Field label="Month" id="filter-month">
              <input
                type="month"
                value={params.get("month") ?? ""}
                onChange={(e) => update({ month: e.target.value || null })}
                className={cn(controlClasses, "h-11")}
              />
            </Field>
          )}
          {period === "year" && (
            <Field label="Year" id="filter-year">
              <Select value={params.get("year") ?? ""} placeholder="Choose a year" onValueChange={(v) => update({ year: v })} options={years.map((y) => ({ value: y, label: y }))} />
            </Field>
          )}
          {period === "range" && (
            <>
              <Field label="From" id="filter-from">
                <DateInput value={params.get("from") ?? ""} onChange={(e) => update({ from: e.target.value || null })} />
              </Field>
              <Field label="To" id="filter-to">
                <DateInput value={params.get("to") ?? ""} onChange={(e) => update({ to: e.target.value || null })} />
              </Field>
            </>
          )}
          {(activeCount > 0 || q || type !== "all") && (
            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ("");
                  setPeriod("all");
                  startTransition(() => router.replace(pathname, { scroll: false }));
                }}
              >
                <X aria-hidden />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
