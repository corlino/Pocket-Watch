"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * G-10 Segmented Control / FR-01 Transaction Type Selector.
 * A radio group: arrow keys move between options, one is always selected.
 */
type Option<T extends string> = { value: T; label: React.ReactNode };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onValueChange: (value: T) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  size?: "sm" | "md";
  className?: string;
  name?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = "md",
  className,
  name,
  ...aria
}: SegmentedControlProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onValueChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      {...aria}
      className={cn(
        "grid gap-1 rounded-md border border-border bg-background-secondary p-1",
        size === "sm" ? "h-9" : "h-11",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {name && <input type="hidden" name={name} value={value} />}
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "rounded-sm px-3 text-caption font-medium transition-colors duration-(--duration-hover) ease-(--ease-out)",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
              selected
                ? "bg-fg text-fg-inverse shadow-card light:bg-brand"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
