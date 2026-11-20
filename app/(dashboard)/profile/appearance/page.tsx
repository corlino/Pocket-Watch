import type { Metadata } from "next";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { AppearancePicker } from "@/components/profile/appearance-picker";
import { getAppearance } from "@/features/transactions/queries";

export const metadata: Metadata = { title: "Appearance" };

export default function AppearancePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Appearance" subtitle="Saved to your account and applied on every device." />
      <Suspense fallback={<div className="h-56" />}>
        <Picker />
      </Suspense>
    </div>
  );
}

async function Picker() {
  return <AppearancePicker initial={await getAppearance()} />;
}
