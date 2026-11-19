import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Previous / next period control (PRD FR-HOME-002). Plain links, so the
 * selected period lives in the URL and survives refresh and navigation.
 */
export function PeriodNavigator({
  label,
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
  currentHref,
  isCurrent,
  className,
}: {
  label: string;
  prevHref: string;
  nextHref: string;
  prevLabel: string;
  nextLabel: string;
  currentHref?: string;
  isCurrent?: boolean;
  className?: string;
}) {
  const btn =
    "inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface-secondary text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
  return (
    <nav aria-label="Reporting period" className={cn("flex items-center gap-2", className)}>
      <Link href={prevHref} className={btn} aria-label={prevLabel} scroll={false}>
        <ChevronLeft className="size-5" aria-hidden />
      </Link>
      <p className="min-w-36 text-center text-body font-semibold text-fg" aria-live="polite">
        {label}
      </p>
      <Link href={nextHref} className={btn} aria-label={nextLabel} scroll={false}>
        <ChevronRight className="size-5" aria-hidden />
      </Link>
      {!isCurrent && currentHref && (
        <Link href={currentHref} scroll={false} className="ml-1 inline-flex min-h-10 items-center rounded-md px-2 text-caption font-medium text-brand hover:underline">
          Today
        </Link>
      )}
    </nav>
  );
}
