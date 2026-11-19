import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { AppHeader, AppHeaderSkeleton } from "@/components/layout/app-header";
import { ComposerProvider } from "@/components/transactions/composer-context";
import { TransactionComposerHost } from "@/components/transactions/transaction-composer-host";

/**
 * Authenticated app shell. Auth is enforced per data read (lib/auth/dal.ts)
 * and by RLS; the shell itself holds no financial data so it can stream first.
 */
export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <ComposerProvider>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto w-full max-w-content flex-1 px-4 pt-safe pb-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom)+24px)] md:px-8 md:pb-10">
            <header className="pt-3 md:pt-6">
              <Suspense fallback={<AppHeaderSkeleton />}>
                <AppHeader />
              </Suspense>
            </header>
            <main id="main" className="pt-4 md:pt-6">
              {children}
            </main>
          </div>
        </div>
      </div>
      <BottomNavigation />
      <Suspense fallback={null}>
        <TransactionComposerHost />
      </Suspense>
    </ComposerProvider>
  );
}
