"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";

/** Pick what to compare (FR-AN-007): month vs month or year vs year. */
export function ComparisonControls({
  mode,
  a,
  b,
  monthOptions,
  yearOptions,
}: {
  mode: "month" | "year";
  a: string;
  b: string;
  monthOptions: { value: string; label: string }[];
  yearOptions: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const options = mode === "month" ? monthOptions : yearOptions;

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
  };

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        aria-label="Compare by"
        size="sm"
        options={[
          { value: "month", label: "Months" },
          { value: "year", label: "Years" },
        ]}
        value={mode}
        onValueChange={(v) => update({ cmp: v === "month" ? null : v, ca: null, cb: null })}
      />
      {/* Stacked on phones so month names never wrap inside the fields. */}
      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Select value={a} onValueChange={(v) => update({ ca: v })} options={options} aria-label="First period" />
        <span className="text-center text-caption text-fg-muted">vs</span>
        <Select value={b} onValueChange={(v) => update({ cb: v })} options={options} aria-label="Second period" />
      </div>
    </div>
  );
}
