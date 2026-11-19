"use client";

import { useState, useTransition } from "react";
import { Bell, Repeat } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { markNotificationsSeen } from "@/features/transactions/actions";
import type { DisplayPrefs, TransactionWithCategory } from "@/features/transactions/types";
import type { IsoDate } from "@/lib/dates/date-only";
import { cn } from "@/lib/utils";

/**
 * G-04 Notification Button. Shows transactions that recurring schedules
 * (including subscriptions) added automatically since it was last opened.
 */
export function NotificationBell({
  transactions,
  unread,
  prefs,
  today,
}: {
  transactions: TransactionWithCategory[];
  unread: number;
  prefs: DisplayPrefs;
  today: IsoDate;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [seen, setSeen] = useState(false);
  const showDot = unread > 0 && !seen;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && unread > 0 && !seen) {
          setSeen(true);
          startTransition(() => void markNotificationsSeen());
        }
      }}
    >
      <SheetTrigger
        aria-label={showDot ? `Notifications, ${unread} new` : "Notifications"}
        className={cn(
          "relative inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface-secondary text-fg-secondary",
          "transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        )}
      >
        <Bell className="size-[18px]" strokeWidth={1.9} aria-hidden />
        {showDot && (
          <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-chart-yellow px-1 text-overline font-semibold text-fg-inverse ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </SheetTrigger>
      <SheetContent title="Automatically added" description="Transactions created by your recurring schedules and subscriptions.">
        {transactions.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="Nothing added automatically yet"
            description="When a recurring transaction or subscription comes due, it will show up here."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {transactions.map((t, i) => (
              <li key={t.id} className="relative">
                {i < unread && !seen ? <span className="sr-only">New: </span> : null}
                <TransactionRow transaction={t} prefs={prefs} today={today} showDate interactive={false} highlight={i < unread} />
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
