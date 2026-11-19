"use client";

import * as React from "react";
import type { TransactionWithCategory } from "@/features/transactions/types";

/**
 * Opens the Add/Edit Transaction sheet from anywhere (FAB, sidebar button,
 * transaction rows) without navigating away (PRD FR-HOME-005).
 */
export type ComposerMode =
  | { kind: "create" }
  | { kind: "edit"; transaction: TransactionWithCategory }
  | { kind: "schedule"; transaction: TransactionWithCategory };

type ComposerContextValue = {
  mode: ComposerMode | null;
  openCreate: () => void;
  openEdit: (transaction: TransactionWithCategory) => void;
  openSchedule: (transaction: TransactionWithCategory) => void;
  close: () => void;
};

const ComposerContext = React.createContext<ComposerContextValue | null>(null);

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ComposerMode | null>(null);
  const value = React.useMemo<ComposerContextValue>(
    () => ({
      mode,
      openCreate: () => setMode({ kind: "create" }),
      openEdit: (transaction) => setMode({ kind: "edit", transaction }),
      openSchedule: (transaction) => setMode({ kind: "schedule", transaction }),
      close: () => setMode(null),
    }),
    [mode],
  );
  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer() {
  const ctx = React.useContext(ComposerContext);
  if (!ctx) throw new Error("useComposer must be used inside ComposerProvider");
  return ctx;
}
