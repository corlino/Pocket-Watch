"use client";

import { cn } from "@/lib/utils";

/** G-19 Filter Chips (All / Income / Expenses). Single-select. */
export function FilterChips<T extends string>({
  options,
  value,
  onValueChange,
  label,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onValueChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "h-8 rounded-full border px-3.5 text-caption font-medium transition-colors duration-(--duration-hover)",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "border-brand bg-brand text-fg-inverse"
                : "border-border bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
