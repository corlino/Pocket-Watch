"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComposer } from "./composer-context";

/** Contextual Add Transaction action (desktop pages and empty states). */
export function AddTransactionButton({ className }: { className?: string }) {
  const { openCreate } = useComposer();
  return (
    <Button onClick={openCreate} className={className}>
      <Plus aria-hidden />
      Add Transaction
    </Button>
  );
}
