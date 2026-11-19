import type { Metadata } from "next";
import { ChartNoAxesCombined } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <ComingSoon
      title="My Analytics"
      icon={ChartNoAxesCombined}
      description="Income vs. expenses, spending breakdowns, trends and savings will appear here in Phase 3."
    />
  );
}
