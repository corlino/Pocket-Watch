import type { Metadata } from "next";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { DisplayNameForm } from "@/components/profile/display-name-form";
import { getProfile } from "@/features/transactions/queries";

export const metadata: Metadata = { title: "Edit Profile" };

export default function EditProfilePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Edit Profile" />
      <Card>
        <Suspense fallback={<div className="h-32" />}>
          <Form />
        </Suspense>
      </Card>
      <p className="px-1 text-caption text-fg-muted">The login greeting stays “Hello Colin, password please.” as specified.</p>
    </div>
  );
}

async function Form() {
  const { displayName } = await getProfile();
  return <DisplayNameForm initial={displayName} />;
}
