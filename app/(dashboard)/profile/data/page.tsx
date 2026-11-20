import type { Metadata } from "next";
import { Suspense } from "react";
import { Download, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RestoreBackup } from "@/components/profile/restore-backup";
import { getDisplayPrefs } from "@/features/transactions/queries";

export const metadata: Metadata = { title: "Data & Backup" };

/** Data management (PRD FR-PRO-007, FR-PRO-008, §10.2). */
export default function DataPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Data & Backup" subtitle="Your financial data belongs to you." />

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-h4 font-semibold text-fg">Export transactions (CSV)</h2>
          <p className="mt-1 text-body text-fg-secondary">
            Every transaction as a spreadsheet: date, type, category, description, notes, amount and whether it was recurring. Opens in Excel,
            Numbers or Google Sheets.
          </p>
        </div>
        <Button asChild variant="secondary" size="lg" className="md:self-start">
          <a href="/api/export" download>
            <FileSpreadsheet aria-hidden />
            Download CSV
          </a>
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-h4 font-semibold text-fg">Full backup</h2>
          <p className="mt-1 text-body text-fg-secondary">
            Everything — transactions, categories, recurring schedules, budgets and preferences — in one JSON file you can restore later.
          </p>
        </div>
        <Button asChild size="lg" className="md:self-start">
          <a href="/api/backup" download>
            <Download aria-hidden />
            Download Backup
          </a>
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-h4 font-semibold text-fg">Restore from backup</h2>
          <p className="mt-1 text-body text-fg-secondary">
            Replace your data with a Pocket Watch backup file. The file is checked first and you&apos;ll see what it contains before anything
            changes.
          </p>
        </div>
        <Suspense fallback={<div className="h-12" />}>
          <Restore />
        </Suspense>
      </Card>

      <Card variant="flat" className="flex gap-3 text-caption text-fg-secondary">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <div>
          <p className="font-medium text-fg">Keep your own copies</p>
          <p className="mt-1">
            The free database plan doesn&apos;t include automatic backups. Download a backup regularly and store it somewhere safe — the file
            contains your full financial history, so treat it like a bank statement.
          </p>
        </div>
      </Card>
    </div>
  );
}

async function Restore() {
  const { dateFormat } = await getDisplayPrefs();
  return <RestoreBackup dateFormat={dateFormat} />;
}
