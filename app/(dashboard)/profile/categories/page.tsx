import type { Metadata } from "next";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryManager } from "@/components/categories/category-manager";
import { TransactionListSkeleton } from "@/components/transactions/transaction-list";
import { listCategoriesWithUsage } from "@/features/categories/queries";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Categories" subtitle="Organise your income and expenses." />
      <Suspense fallback={<TransactionListSkeleton rows={8} />}>
        <Manager />
      </Suspense>
    </div>
  );
}

async function Manager() {
  return <CategoryManager categories={await listCategoriesWithUsage()} />;
}
