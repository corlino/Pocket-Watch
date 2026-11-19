"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Budget category carousel for Home.
 * - Phone (<640px): exactly one whole card per view, 16px side margins,
 *   snaps so a full card is always centred; dots show position.
 * - Small tablet (640–767px): two cards per view.
 * - md and up: a regular grid (no scrolling).
 * The last slide links to the Budget page.
 */
export function BudgetCarousel({
  cards,
  seeAllHref,
  label = "Budget categories",
}: {
  cards: { id: string; node: React.ReactNode; name: string }[];
  seeAllHref: string;
  label?: string;
}) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const slideCount = cards.length + 1; // + "see all" slide

  const slideStep = React.useCallback(() => {
    const el = scroller.current;
    const first = el?.querySelector<HTMLElement>("[data-slide]");
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  const onScroll = React.useCallback(() => {
    const el = scroller.current;
    const step = slideStep();
    if (!el || !step) return;
    setActive(Math.max(0, Math.min(slideCount - 1, Math.round(el.scrollLeft / step))));
  }, [slideCount, slideStep]);

  const goTo = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * slideStep(), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div>
      <div
        ref={scroller}
        onScroll={onScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className={cn(
          // Bleed to the screen edges so swipes use the full width; the
          // leading padding + trailing spacer give each card a 16px margin.
          "-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-8 overflow-x-auto pl-4 sm:gap-3",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:pl-0 xl:grid-cols-1 2xl:grid-cols-2",
        )}
      >
        {cards.map((c, i) => (
          <div
            key={c.id}
            data-slide
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slideCount}: ${c.name}`}
            className="w-[calc(100%-16px)] shrink-0 snap-start snap-always sm:w-[calc((100%-28px)/2)] md:w-auto [&>*]:h-full"
          >
            {c.node}
          </div>
        ))}
        <div
          data-slide
          role="group"
          aria-roledescription="slide"
          aria-label={`${slideCount} of ${slideCount}`}
          className="w-[calc(100%-16px)] shrink-0 snap-start snap-always sm:w-[calc((100%-28px)/2)] md:hidden"
        >
          <Link
            href={seeAllHref}
            className="flex h-full min-h-[132px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface/50 p-4 text-center transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand-secondary light:text-brand">
              <ArrowRight className="size-5" aria-hidden />
            </span>
            <span className="text-body font-semibold text-fg">See all budgets</span>
            <span className="text-caption text-fg-muted">Manage allocations on the Budget page</span>
          </Link>
        </div>
        {/* Trailing spacer keeps a right margin after the last slide (gap supplies it). */}
        <div aria-hidden className="w-px shrink-0 sm:w-1 md:hidden" />
      </div>

      {slideCount > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 md:hidden" role="group" aria-label="Choose slide">
          {Array.from({ length: slideCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1} of ${slideCount}`}
              aria-current={i === active ? "true" : undefined}
              className="group inline-flex h-6 min-w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-[width,background-color] duration-(--duration-card)",
                  i === active ? "w-5 bg-brand" : "w-1.5 bg-border-strong group-hover:bg-fg-muted",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
