import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Budget" };

export default function BudgetPage() {
  return (
    <ComingSoon
      title="My Budget"
      icon={Wallet}
      description="Monthly and yearly budgets, category spending and subscriptions arrive in Phase 2."
    />
  );
}
