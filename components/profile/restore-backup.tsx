"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Download, FileJson, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MAX_BACKUP_BYTES, validateBackup, type BackupSummary } from "@/features/backup/validate";
import { formatDate, type DateFormat } from "@/lib/formatting";
import type { IsoDate } from "@/lib/dates/date-only";

type Stage =
  | { kind: "idle" }
  | { kind: "invalid"; fileName: string; errors: string[] }
  | { kind: "ready"; fileName: string; text: string; summary: BackupSummary }
  | { kind: "done"; counts: Record<string, number> };

/**
 * Restore flow (PRD §10.2): pick a file → validated preview → explicit
 * confirmation (type RESTORE) → server re-validates and restores atomically.
 */
export function RestoreBackup({ dateFormat }: { dateFormat: DateFormat }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [stage, setStage] = React.useState<Stage>({ kind: "idle" });
  const [confirm, setConfirm] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const reset = () => {
    setStage({ kind: "idle" });
    setConfirm("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setConfirm("");
    if (file.size > MAX_BACKUP_BYTES) return setStage({ kind: "invalid", fileName: file.name, errors: ["That file is larger than 4 MB."] });
    const text = await file.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return setStage({ kind: "invalid", fileName: file.name, errors: ["That file isn't valid JSON."] });
    }
    const result = validateBackup(json);
    setStage(result.ok ? { kind: "ready", fileName: file.name, text, summary: result.summary } : { kind: "invalid", fileName: file.name, errors: result.errors });
  };

  const restore = () => {
    if (stage.kind !== "ready" || confirm !== "RESTORE") return;
    startTransition(async () => {
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Confirm-Restore": "RESTORE" },
        body: stage.text,
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; details?: string[]; counts?: Record<string, number> };
      if (!res.ok || !body.ok) {
        toast.error(body.error ?? "Restore failed and nothing was changed.");
        if (body.details) setStage({ kind: "invalid", fileName: stage.fileName, errors: body.details });
        return;
      }
      toast.success("Backup restored");
      setStage({ kind: "done", counts: body.counts ?? {} });
      setConfirm("");
      router.refresh();
    });
  };

  const d = (iso: string | null) => (iso ? formatDate(iso as IsoDate, dateFormat) : "—");

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only text-body-lg"
        id="restore-file"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {stage.kind === "idle" && (
        <Button asChild variant="secondary" size="lg" className="md:self-start">
          <label htmlFor="restore-file" className="cursor-pointer">
            <Upload aria-hidden />
            Choose backup file
          </label>
        </Button>
      )}

      {stage.kind === "invalid" && (
        <div role="alert" className="rounded-md border border-expense/40 bg-expense/10 p-3">
          <p className="flex items-center gap-2 text-body font-semibold text-fg">
            <AlertTriangle className="size-4 text-expense" aria-hidden />
            Can&apos;t restore {stage.fileName}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-caption text-fg-secondary">
            {stage.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-2 text-caption text-fg-muted">Nothing was changed.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
            Choose a different file
          </Button>
        </div>
      )}

      {stage.kind === "ready" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-border bg-surface-secondary p-3">
            <div className="flex items-start gap-3">
              <FileJson className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold text-fg">{stage.fileName}</p>
                <p className="text-caption text-fg-muted">Backed up {new Date(stage.summary.exportedAt).toLocaleString()}</p>
              </div>
              <button type="button" onClick={reset} aria-label="Remove file" className="inline-flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-hover hover:text-fg">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-caption sm:grid-cols-4">
              {[
                ["Transactions", stage.summary.counts.transactions],
                ["Categories", stage.summary.counts.categories],
                ["Recurring", stage.summary.counts.recurring_schedules],
                ["Budgets", stage.summary.counts.budgets],
              ].map(([label, n]) => (
                <div key={label} className="rounded-sm bg-surface p-2">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd className="money text-body font-semibold text-fg">{n}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-caption text-fg-secondary">
              Transactions from {d(stage.summary.firstDate)} to {d(stage.summary.lastDate)}. Validated — every reference checks out.
            </p>
          </div>

          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-caption text-fg-secondary">
            <p className="flex items-center gap-2 font-semibold text-fg">
              <AlertTriangle className="size-4 text-warning" aria-hidden />
              This replaces all your current data
            </p>
            <p className="mt-1">
              Every transaction, category, recurring schedule and budget now in Pocket Watch will be replaced by this backup. This can&apos;t be
              undone — download a backup of your current data first if you might need it.
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-2">
              <a href="/api/backup" download>
                <Download aria-hidden />
                Download current backup
              </a>
            </Button>
          </div>

          <Field label='Type RESTORE to confirm' id="restore-confirm">
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value.toUpperCase())} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
          </Field>
          <Button variant="destructive-solid" size="lg" block loading={pending} disabled={confirm !== "RESTORE"} onClick={restore} className="md:w-auto md:self-start">
            Replace my data with this backup
          </Button>
        </div>
      )}

      {stage.kind === "done" && (
        <div role="status" className="rounded-md border border-income/40 bg-income/10 p-3">
          <p className="flex items-center gap-2 text-body font-semibold text-fg">
            <CheckCircle2 className="size-4 text-income" aria-hidden />
            Restore complete
          </p>
          <p className="mt-1 text-caption text-fg-secondary">
            Restored {stage.counts.transactions ?? 0} transactions, {stage.counts.categories ?? 0} categories, {stage.counts.recurring_schedules ?? 0} recurring
            schedules and {stage.counts.budgets ?? 0} budgets.
          </p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
