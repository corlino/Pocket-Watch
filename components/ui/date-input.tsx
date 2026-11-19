import * as React from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlClasses } from "./input";

/**
 * G-16 Date Input. Uses the native date picker (best on iOS) with the
 * Pocket Watch surface and calendar icon. id/aria props land on the <input>
 * so <Field> labels and errors stay associated.
 */
export function DateInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <div className="relative w-full min-w-0">
      <input
        type="date"
        className={cn(controlClasses, "h-11 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0", className)}
        {...props}
      />
      <CalendarDays aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted" />
    </div>
  );
}
