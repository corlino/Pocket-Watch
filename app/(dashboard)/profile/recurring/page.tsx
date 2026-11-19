import type { Metadata } from "next";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { ScheduleList } from "@/components/transactions/schedule-list";
import { TransactionListSkeleton } from "@/components/transactions/transaction-list";
import { getDisplayPrefs, listCategories, listSchedules } from "@/features/transactions/queries";

export const metadata: Metadata = { title: "Recurring" };

export default function RecurringPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Recurring" subtitle="Transactions that repeat automatically." />
      <Suspense fallback={<TransactionListSkeleton rows={4} />}>
        <Schedules />
      </Suspense>
    </div>
  );
}

async function Schedules() {
  const [schedules, categories, prefs] = await Promise.all([listSchedules(), listCategories(), getDisplayPrefs()]);
  return <ScheduleList schedules={schedules} categories={categories} prefs={prefs} />;
}
