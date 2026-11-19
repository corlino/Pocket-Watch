import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Previous / next reporting-period control (PRD FR-HOME-002). One component
 * for every page so the period label looks and behaves the same everywhere:
 * arrows at the edges, label centred, optional "back to current" link below.
 * Plain links — the period lives in the URL.
 */
export function PeriodNavigator({
  label,
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
  currentHref,
  currentLabel = "Back to current month",
  isCurrent,
  className,
}: {
  label: string;
  prevHref: string;
  nextHref: string;
  prevLabel: string;
  nextLabel: string;
  currentHref?: string;
  currentLabel?: string;
  isCurrent?: boolean;
  className?: string;
}) {
  const btn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface-secondary text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
  return (
    <nav aria-label="Reporting period" className={cn("mx-auto w-full max-w-sm", className)}>
      <div className="flex items-center justify-between gap-3">
        <Link href={prevHref} className={btn} aria-label={prevLabel} scroll={false}>
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <p className="min-w-0 flex-1 truncate text-center text-h4 font-semibold text-fg" aria-live="polite">
          {label}
        </p>
        <Link href={nextHref} className={btn} aria-label={nextLabel} scroll={false}>
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      </div>
      {!isCurrent && currentHref && (
        <div className="mt-1.5 flex justify-center">
          <Link href={currentHref} scroll={false} className="rounded-sm px-1 text-caption font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">
            {currentLabel}
          </Link>
        </div>
      )}
    </nav>
  );
}
