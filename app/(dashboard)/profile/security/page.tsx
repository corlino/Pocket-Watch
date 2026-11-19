import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Security" subtitle="Change the password you use to open Pocket Watch." />
      <Card>
        <ChangePasswordForm />
      </Card>
      <Card variant="flat" className="text-caption text-fg-secondary">
        <p className="font-medium text-fg">Forgot your password?</p>
        <p className="mt-1">
          Recovery is owner-controlled: run <code className="rounded bg-surface px-1 py-0.5 text-fg">npm run admin:reset</code> from the
          project on your computer. There is deliberately no email reset link.
        </p>
      </Card>
    </div>
  );
}
