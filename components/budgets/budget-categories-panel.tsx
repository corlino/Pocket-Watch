"use client";

import * as React from "react";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { BudgetForm } from "./budget-form";
import type { Category, DisplayPrefs } from "@/features/transactions/types";

export type BudgetCardModel = {
  id: string;
  amount: string;
  category: Pick<Category, "id" | "name" | "icon" | "color">;
  /** Server-rendered BudgetCategoryCard. */
  card: React.ReactNode;
};

/** Categories tab: budget cards + create/edit sheets (FR-BUD-002…005). */
export function BudgetCategoriesPanel({
  cards,
  availableCategories,
  periodType,
  periodIdentifier,
  periodLabel,
  prefs,
  transactionsHrefBase,
}: {
  cards: BudgetCardModel[];
  availableCategories: Category[];
  periodType: "monthly" | "yearly";
  periodIdentifier: string;
  periodLabel: string;
  prefs: DisplayPrefs;
  transactionsHrefBase: string;
}) {
  const [mode, setMode] = React.useState<{ kind: "create" } | { kind: "edit"; card: BudgetCardModel } | null>(null);

  return (
    <section aria-labelledby="budget-categories-heading">
      <SectionHeader
        id="budget-categories-heading"
        title="Budget Categories"
        action={
          <Button size="sm" onClick={() => setMode({ kind: "create" })}>
            <Plus aria-hidden />
            Add
          </Button>
        }
      />
      {cards.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface">
          <EmptyState
            icon={Wallet}
            title="You haven't created a budget for this period."
            description="Pick an expense category and set a limit to track your spending against it."
            action={
              <Button onClick={() => setMode({ kind: "create" })}>
                <Plus aria-hidden />
                Add Budget Category
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {cards.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setMode({ kind: "edit", card: c })}
                aria-label={`${c.category.name} budget. Edit`}
                className="block w-full rounded-lg text-left transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&>*]:transition-colors [&>*]:hover:bg-surface-hover"
              >
                {c.card}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        {mode && (
          <SheetContent title={mode.kind === "create" ? "Add Budget Category" : "Edit Budget"} key={mode.kind === "create" ? "create" : mode.card.id}>
            <BudgetForm
              mode={mode.kind === "create" ? { kind: "create" } : { kind: "edit", id: mode.card.id, amount: mode.card.amount, category: mode.card.category }}
              periodType={periodType}
              periodIdentifier={periodIdentifier}
              periodLabel={periodLabel}
              categories={availableCategories}
              prefs={prefs}
              onDone={() => setMode(null)}
              transactionsHref={mode.kind === "edit" ? `${transactionsHrefBase}&category=${mode.card.category.id}` : undefined}
            />
          </SheetContent>
        )}
      </Sheet>
    </section>
  );
}
