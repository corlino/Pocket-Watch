import type { Metadata } from "next";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { RegionalSettings } from "@/components/profile/regional-settings";
import { getDisplayPrefs } from "@/features/transactions/queries";
import { appToday } from "@/lib/dates/today";

export const metadata: Metadata = { title: "Regional" };

export default function RegionalPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Regional" subtitle="Currency, date and number display." />
      <Card>
        <Suspense fallback={<div className="h-80" />}>
          <Settings />
        </Suspense>
      </Card>
    </div>
  );
}

async function Settings() {
  const [prefs, today] = await Promise.all([getDisplayPrefs(), appToday()]);
  return <RegionalSettings initial={prefs} today={today} />;
}
