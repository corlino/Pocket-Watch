"use client";

import { Toaster as Sonner } from "sonner";

/** Toast notifications (style guide §7.10): brief, unobtrusive, themed. */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      duration={3000}
      offset={{ top: "max(16px, env(safe-area-inset-top))" }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-md !border !border-border !bg-background-elevated !text-fg !shadow-float !text-body !font-sans",
          description: "!text-fg-muted",
          success: "[&_[data-icon]]:!text-income",
          error: "[&_[data-icon]]:!text-expense",
        },
      }}
    />
  );
}
