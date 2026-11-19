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
              // Narrow phones: icon above the name (as in the reference) so long
              // single words like "Transportation" get the full tile width.
              "relative flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-md border px-2 py-2.5 text-center text-caption font-medium transition-colors duration-(--duration-hover)",
              "min-[400px]:flex-row min-[400px]:justify-start min-[400px]:gap-2.5 min-[400px]:px-2.5 min-[400px]:py-2 min-[400px]:text-left",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "border-brand bg-brand-soft text-fg"
                : "border-border bg-surface text-fg-secondary hover:bg-surface-hover hover:text-fg",
            )}
          >
            <CategoryIcon icon={c.icon} color={c.color} size="sm" />
            <span className="line-clamp-2 max-w-full min-w-0 leading-tight break-words min-[400px]:flex-1">{c.name}</span>
            {selected && (
              <Check
                className="absolute top-1.5 right-1.5 size-4 shrink-0 text-brand min-[400px]:static"
                strokeWidth={2.4}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
