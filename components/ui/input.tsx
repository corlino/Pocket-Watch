import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared control surface for inputs, selects and textareas (G-14, style guide §7.6). */
export const controlClasses = cn(
  // 16px on phones: iOS Safari zooms the whole page when a field under 16px
  // gets focus. 14px from tablet up per the type scale.
  "w-full rounded-md border border-border bg-surface-input px-3 text-body-lg text-fg md:text-body",
  "placeholder:text-fg-muted",
  "transition-[border-color,box-shadow] duration-(--duration-hover) ease-(--ease-out)",
  "hover:border-border-strong",
  "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
  "aria-invalid:border-expense aria-invalid:focus-visible:ring-expense/30",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(controlClasses, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea data-slot="textarea" className={cn(controlClasses, "min-h-20 resize-y py-2.5", className)} {...props} />
  );
}
