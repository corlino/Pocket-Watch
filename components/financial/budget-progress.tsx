import { AlertTriangle, CircleAlert } from "lucide-react";
import type { BudgetStatus } from "@/lib/calculations";
import { cn } from "@/lib/utils";

const FILL: Record<BudgetStatus, string> = {
  normal: "bg-brand",
  warning: "bg-warning",
  exceeded: "bg-exceeded",
  unavailable: "bg-chart-muted",
};

/**
 * G-20 Progress Bar. The fill stops at 100% visually; the true percentage is
 * shown as text. Warning/exceeded states add an icon + label so status never
 * relies on colour alone (style guide §7.5, §15).
 */
export function BudgetProgressBar({
  percent,
  status,
  label,
}: {
  /** Utilisation 0–∞ (null when unavailable). */
  percent: number | null;
  status: BudgetStatus;
  label: string;
}) {
  const width = percent == null ? 0 : Math.min(100, Math.max(0, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      aria-valuetext={percent == null ? "Utilisation unavailable" : `${Math.round(percent)}% used${status === "exceeded" ? ", over budget" : status === "warning" ? ", approaching limit" : ""}`}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-tertiary"
    >
      <div className={cn("h-full rounded-full transition-[width] duration-(--duration-card)", FILL[status])} style={{ width: `${width}%` }} />
    </div>
  );
}

export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
  if (status === "exceeded")
    return (
      <span className="inline-flex items-center gap-1 text-caption font-medium text-exceeded">
        <CircleAlert className="size-3.5" aria-hidden /> Over budget
      </span>
    );
  if (status === "warning")
    return (
      <span className="inline-flex items-center gap-1 text-caption font-medium text-warning">
        <AlertTriangle className="size-3.5" aria-hidden /> Nearly used
      </span>
    );
  return null;
}
