import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, ReceiptText } from "lucide-react";
import { SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { RecentActivity } from "@/components/transactions/recent-activity";
import { TransactionListSkeleton } from "@/components/transactions/transaction-list";
import { getDisplayPrefs, listTransactions } from "@/features/transactions/queries";
import { appToday } from "@/lib/dates/today";
import { formatMonthYear } from "@/lib/formatting";

export const metadata: Metadata = { title: "Home" };

/**
 * Home. Phase 1 shows Recent Activity; the monthly KPIs, budget overview and
 * cash-flow chart arrive in Phase 2.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<div className="h-14" />}>
        <Heading />
      </Suspense>
      <section aria-labelledby="recent-activity">
        <SectionHeader
          id="recent-activity"
          title="Recent Activity"
          action={
            <Link href="/transactions" className="inline-flex min-h-11 items-center gap-1 text-caption font-medium text-brand hover:underline">
              View All <ChevronRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <Suspense fallback={<TransactionListSkeleton rows={5} />}>
          <Recent />
        </Suspense>
      </section>
    </div>
  );
}

async function Heading() {
  const today = await appToday();
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h1 className="text-h2 font-semibold text-fg md:text-h1">Overview</h1>
        <p className="mt-1 text-body text-fg-muted">{formatMonthYear(today)}</p>
      </div>
      <AddTransactionButton className="hidden md:inline-flex lg:hidden" />
    </div>
  );
}

async function Recent() {
  const today = await appToday();
  const [{ rows }, prefs] = await Promise.all([listTransactions({}, { limit: 30 }), getDisplayPrefs()]);
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Nothing here yet"
        description="Add your first transaction to start tracking your finances."
        action={<AddTransactionButton />}
      />
    );
  }
  return <RecentActivity transactions={rows} prefs={prefs} today={today} />;
}
