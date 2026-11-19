"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drawer / dialog surface (style guide §7.9, component spec §8.4):
 * a bottom sheet on mobile, a centred dialog from md upward.
 * Radix handles focus trapping, Escape, scroll lock and focus return.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  title,
  description,
  children,
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-overlay/70 backdrop-blur-[2px]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col border border-border bg-background-elevated text-fg shadow-float outline-none",
          "duration-(--duration-modal) ease-(--ease-out)",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl pb-safe",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
          // Desktop: centred dialog
          "md:inset-auto md:top-1/2 md:left-1/2 md:max-h-[85dvh] md:w-full md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-0",
          "md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=open]:zoom-in-95 md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=closed]:zoom-out-95",
          size === "sm" ? "md:max-w-sm" : "md:max-w-lg",
          className,
        )}
        {...props}
      >
        <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong md:hidden" />
        <header className="flex items-start justify-between gap-3 px-4 pt-3 pb-2 md:px-6 md:pt-5">
          <div className="min-w-0">
            <DialogPrimitive.Title className="text-h3 font-semibold">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-caption text-fg-muted">{description}</DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            className="-mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-brand"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </DialogPrimitive.Close>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
