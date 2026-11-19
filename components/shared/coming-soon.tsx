import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "./empty-state";
import { Card } from "@/components/ui/card";

/** Placeholder for destinations scheduled in later phases. No mock data. */
export function ComingSoon({ title, icon, description }: { title: string; icon: LucideIcon; description: string }) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={title} />
      <Card padding="none">
        <EmptyState icon={icon} title="Coming in a later phase" description={description} />
      </Card>
    </div>
  );
}
