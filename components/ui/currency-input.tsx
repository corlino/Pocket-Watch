"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { controlClasses } from "./input";

/**
 * G-15 Currency Input. Keeps the raw text the user typed (never a float),
 * blocks characters that can't form an amount, and limits to 2 decimals.
 * Validation and conversion happen in lib/money.ts on the server.
 */
type CurrencyInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> & {
  symbol: string;
  value: string;
  onValueChange: (value: string) => void;
};

const PARTIAL_AMOUNT = /^\d*(\.\d{0,2})?$/;

/**
 * Keep digits and the first decimal point, trim to 2 decimals. Used for pastes
 * or autofill like "$1,234.567" → "1234.56" instead of rejecting them outright.
 */
function sanitize(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [int, ...rest] = cleaned.split(".");
  return rest.length ? `${int}.${rest.join("").slice(0, 2)}` : int;
}

export function CurrencyInput({ symbol, value, onValueChange, className, ...props }: CurrencyInputProps) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-body-lg font-medium text-fg-muted"
      >
        {symbol}
      </span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={value}
        onChange={(e) => {
          const next = e.target.value.replace(/,/g, "");
          onValueChange(PARTIAL_AMOUNT.test(next) ? next : sanitize(next));
        }}
        className={cn(controlClasses, "money h-12 pl-8 text-body-lg font-medium", className)}
        {...props}
      />
    </div>
  );
}
