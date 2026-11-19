"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { CategoryIcon } from "./category-icon";
import type { Category } from "@/features/transactions/types";
import { cn } from "@/lib/utils";

/**
 * FR-03 Category Selection Grid: two columns (three on wider sheets),
 * single-select radio group using real category data.
 */
export function CategorySelectionGrid({
  categories,
  value,
  onValueChange,
  label,
  invalid,
  describedBy,
}: {
  categories: Pick<Category, "id" | "name" | "icon" | "color">[];
  value: string;
  onValueChange: (id: string) => void;
  label: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = categories.findIndex((c) => c.id === value);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const cols = window.matchMedia("(min-width: 480px)").matches ? 3 : 2;
    const deltas: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
    const d = deltas[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const next = Math.min(categories.length - 1, Math.max(0, i + d));
    onValueChange(categories[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3"
    >
      {categories.map((c, i) => {
        const selected = c.id === value;
        return (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex === -1 && i === 0) ? 0 : -1}
            onClick={() => onValueChange(c.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative flex min-h-14 items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-caption font-medium transition-colors duration-(--duration-hover)",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "border-brand bg-brand-soft text-fg"
                : "border-border bg-surface text-fg-secondary hover:bg-surface-hover hover:text-fg",
            )}
          >
            <CategoryIcon icon={c.icon} color={c.color} size="sm" />
            <span className="line-clamp-2 min-w-0 flex-1 leading-tight">{c.name}</span>
            {selected && <Check className="size-4 shrink-0 text-brand" strokeWidth={2.4} aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
