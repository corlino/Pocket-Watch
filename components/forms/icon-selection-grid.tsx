"use client";

import * as React from "react";
import { CATEGORY_ICONS, type CategoryIconName } from "@/lib/categories";
import { cn } from "@/lib/utils";

const LABELS: Partial<Record<CategoryIconName, string>> = {
  "car-front": "Car",
  "shopping-basket": "Basket",
  "shopping-bag": "Bag",
  "heart-pulse": "Health",
  "graduation-cap": "Education",
  "circle-ellipsis": "Other",
  "chart-line": "Chart",
  "badge-dollar-sign": "Dollar",
  "circle-plus": "Plus",
  "piggy-bank": "Piggy bank",
  "gamepad-2": "Games",
  "paw-print": "Pets",
};

function label(name: string) {
  return LABELS[name as CategoryIconName] ?? name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
}

/**
 * FR-08 Icon Selection Grid. Stores the icon identifier, not a component.
 * Radio group with arrow-key navigation.
 */
export function IconSelectionGrid({ value, onValueChange, tileClass }: { value: string; onValueChange: (v: string) => void; tileClass: string }) {
  const names = Object.keys(CATEGORY_ICONS) as CategoryIconName[];
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selected = Math.max(0, names.indexOf(value as CategoryIconName));

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const cols = 6;
    const d = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols } as Record<string, number>)[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const next = Math.min(names.length - 1, Math.max(0, i + d));
    onValueChange(names[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label="Icon" className="grid grid-cols-6 gap-2">
      {names.map((name, i) => {
        const Icon = CATEGORY_ICONS[name];
        const isSelected = i === selected && value === name;
        return (
          <button
            key={name}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={label(name)}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => onValueChange(name)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex aspect-square min-h-11 items-center justify-center rounded-md border transition-colors duration-(--duration-hover)",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              isSelected ? cn("border-brand", tileClass) : "border-border bg-surface text-fg-secondary hover:bg-surface-hover hover:text-fg",
            )}
          >
            <Icon className="size-5" strokeWidth={1.9} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
