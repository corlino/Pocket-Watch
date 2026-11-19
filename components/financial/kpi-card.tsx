import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * F-02 Financial Metric Card. Receives a pre-formatted value — never
 * calculates (component spec §11.2).
 */
export type KpiTone = "income" | "expense" | "neutral" | "positive" | "negative" | "warning";

const TONE: Record<KpiTone, string> = {
  income: "text-income",
  expense: "text-expense",
  neutral: "text-fg",
  positive: "text-positive",
  negative: "text-negative",
  warning: "text-warning",
};

export function KpiCard({
  label,
  value,
  tone = "neutral",
  icon: Icon,
  hint,
  srValue,
  elevated,
  className,
}: {
  label: string;
  value: string;
  tone?: KpiTone;
  icon?: LucideIcon;
  hint?: React.ReactNode;
  /** Spoken alternative when the visual value is ambiguous (e.g. "unavailable"). */
  srValue?: string;
  elevated?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-lg border border-border p-3.5 md:p-4",
        elevated ? "bg-surface-secondary shadow-card" : "bg-surface",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-caption font-medium text-fg-muted">
        {Icon && <Icon className="size-3.5" strokeWidth={2} aria-hidden />}
        {label}
      </p>
      <p className={cn("money truncate text-h3 font-semibold md:text-h2", TONE[tone])}>
        <span aria-hidden={srValue ? true : undefined}>{value}</span>
        {srValue && <span className="sr-only">{srValue}</span>}
      </p>
      {hint && <p className="text-caption text-fg-muted">{hint}</p>}
    </div>
  );
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[86px] animate-pulse rounded-lg bg-surface" />
      ))}
    </div>
  );
}
