"use client";

import * as React from "react";
import { Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CategoryIcon } from "./category-icon";
import { CategoryForm } from "./category-form";
import { setCategoryArchived } from "@/features/categories/actions";
import type { CategoryWithUsage } from "@/features/categories/queries";
import type { TransactionType } from "@/features/transactions/types";

function usage(c: CategoryWithUsage) {
  const parts = [`${c.transactionCount} transaction${c.transactionCount === 1 ? "" : "s"}`];
  if (c.activeScheduleCount) parts.push(`${c.activeScheduleCount} recurring`);
  return parts.join(" · ");
}

/** FR-PRO-006 category management: create, edit, archive, restore. */
export function CategoryManager({ categories }: { categories: CategoryWithUsage[] }) {
  const [type, setType] = React.useState<TransactionType>("expense");
  const [editing, setEditing] = React.useState<CategoryWithUsage | "new" | null>(null);
  const [archiving, setArchiving] = React.useState<CategoryWithUsage | null>(null);
  const [pending, startTransition] = React.useTransition();

  const ofType = categories.filter((c) => c.category_type === type);
  const active = ofType.filter((c) => !c.is_archived);
  const archived = ofType.filter((c) => c.is_archived);

  const toggleArchive = (c: CategoryWithUsage, archive: boolean) =>
    startTransition(async () => {
      const result = await setCategoryArchived(c.id, archive);
      if (!result.ok) return void toast.error(result.error);
      toast.success(archive ? `${c.name} archived` : `${c.name} restored`);
      setArchiving(null);
    });

  const row = (c: CategoryWithUsage) => (
    <li key={c.id} className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
      <CategoryIcon icon={c.icon} color={c.color} className={c.is_archived ? "opacity-60" : undefined} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-fg">{c.name}</p>
        <p className="text-caption text-fg-muted">{usage(c)}</p>
      </div>
      {c.is_archived ? (
        <Button variant="secondary" size="sm" onClick={() => toggleArchive(c, false)} disabled={pending} aria-label={`Restore ${c.name}`}>
          <ArchiveRestore aria-hidden />
          Restore
        </Button>
      ) : (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
            <Pencil aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setArchiving(c)} aria-label={`Archive ${c.name}`}>
            <Archive aria-hidden />
          </Button>
        </div>
      )}
    </li>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SegmentedControl
          aria-label="Category type"
          className="flex-1"
          options={[
            { value: "expense", label: "Expense" },
            { value: "income", label: "Income" },
          ]}
          value={type}
          onValueChange={setType}
        />
        <Button onClick={() => setEditing("new")}>
          <Plus aria-hidden />
          Add
        </Button>
      </div>

      <section aria-labelledby="active-categories">
        <h2 id="active-categories" className="mb-2 px-1 text-caption font-semibold tracking-wide text-fg-secondary uppercase">
          Active ({active.length})
        </h2>
        {active.length ? (
          <ul className="flex flex-col gap-2">{active.map(row)}</ul>
        ) : (
          <p className="rounded-lg bg-surface p-4 text-center text-body text-fg-muted">No active {type} categories. Add one to start using it.</p>
        )}
      </section>

      {archived.length > 0 && (
        <section aria-labelledby="archived-categories">
          <h2 id="archived-categories" className="mb-1 px-1 text-caption font-semibold tracking-wide text-fg-secondary uppercase">
            Archived ({archived.length})
          </h2>
          <p className="mb-2 px-1 text-caption text-fg-muted">Hidden from new transactions and budgets. Past transactions keep them.</p>
          <ul className="flex flex-col gap-2">{archived.map(row)}</ul>
        </section>
      )}

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing !== null && (
          <SheetContent title={editing === "new" ? "Add Category" : "Edit Category"} key={editing === "new" ? "new" : editing.id}>
            <CategoryForm category={editing === "new" ? undefined : editing} defaultType={type} onDone={() => setEditing(null)} />
          </SheetContent>
        )}
      </Sheet>

      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(o) => !o && setArchiving(null)}
        title={`Archive ${archiving?.name ?? "category"}?`}
        description={
          <>
            It won&apos;t be offered for new transactions or budgets. Past transactions keep it, and you can restore it any time.
            {archiving?.activeScheduleCount ? (
              <span className="mt-2 block text-warning">
                {archiving.activeScheduleCount} active recurring schedule{archiving.activeScheduleCount === 1 ? " uses" : "s use"} this
                category and will keep adding transactions until stopped.
              </span>
            ) : null}
          </>
        }
        confirmLabel="Archive"
        onConfirm={() => archiving && toggleArchive(archiving, true)}
        pending={pending}
      />
    </div>
  );
}
