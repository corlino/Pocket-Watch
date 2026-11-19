import type { Metadata } from "next";
import { Download, ShieldAlert } from "lucide-react";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Data & Backup" };

export default function DataPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Data & Backup" subtitle="Your financial data belongs to you." />

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-h4 font-semibold text-fg">Full backup</h2>
          <p className="mt-1 text-body text-fg-secondary">
            Downloads everything — transactions, categories, recurring schedules, budgets and preferences — as a single JSON file.
          </p>
        </div>
        <Button asChild size="lg" className="md:self-start">
          {/* Plain link: the browser handles the file download. */}
          <a href="/api/backup" download>
            <Download aria-hidden />
            Download Backup
          </a>
        </Button>
      </Card>

      <Card variant="flat" className="flex gap-3 text-caption text-fg-secondary">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <div>
          <p className="font-medium text-fg">Keep your own copies</p>
          <p className="mt-1">
            The free database plan doesn&apos;t include automatic backups. Download a backup regularly and store it somewhere safe — the file
            contains your full financial history, so treat it like a bank statement.
          </p>
          <p className="mt-2">CSV export and restoring from a backup arrive in Phase 4.</p>
        </div>
      </Card>
    </div>
  );
}
