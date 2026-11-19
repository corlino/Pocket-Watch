import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ReceiptText, SearchX } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList, TransactionListSkeleton } from "@/components/transactions/transaction-list";
import { getDisplayPrefs, listCategories, listTransactions, parseFilters } from "@/features/transactions/queries";
import { parts } from "@/lib/dates/date-only";
import { appToday } from "@/lib/dates/today";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Transactions" };

const PAGE = 50;

/** FR-TRANS-008 complete transaction history, newest first. */
export default function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Transactions" subtitle="Every income and expense you've recorded." actions={<AddTransactionButton className="hidden md:inline-flex lg:hidden" />} />
      <Suspense fallback={<TransactionListSkeleton />}>
        <History searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function History({ searchParams }: { searchParams: PageProps<"/transactions">["searchParams"] }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const limit = Math.min(Math.max(Number(params.limit) || PAGE, PAGE), 1000);
  const today = await appToday();
  const [{ rows, hasMore }, categories, prefs] = await Promise.all([listTransactions(filters, { limit }), listCategories(), getDisplayPrefs()]);
  const filtered = Object.keys(filters).length > 0;

  const moreHref = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => typeof e[1] === "string"));
  moreHref.set("limit", String(limit + PAGE));

  return (
    <>
      <TransactionFilters categories={categories} currentYear={parts(today).year} />
      {rows.length === 0 ? (
        filtered ? (
          <EmptyState icon={SearchX} title="No matching transactions" description="Try a different search or clear your filters." />
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="Nothing here yet"
            description="Add your first transaction to start tracking your finances."
            action={<AddTransactionButton />}
          />
        )
      ) : (
        <>
          <p className="sr-only" role="status">
            Showing {rows.length} transactions{hasMore ? ", more available" : ""}.
          </p>
          <TransactionList transactions={rows} prefs={prefs} today={today} />
          {hasMore && (
            <Button asChild variant="secondary" className="self-center">
              <Link href={`/transactions?${moreHref}`} scroll={false}>
                Show more
              </Link>
            </Button>
          )}
        </>
      )}
    </>
  );
}
