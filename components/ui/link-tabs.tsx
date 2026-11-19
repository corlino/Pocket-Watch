import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Segmented navigation whose options are links (state lives in the URL).
 * Same look as SegmentedControl; announced as current page.
 */
export function LinkTabs({
  items,
  label,
  className,
  size = "md",
}: {
  items: { href: string; label: string; active: boolean }[];
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <nav aria-label={label} className={cn("grid gap-1 rounded-md border border-border bg-background-secondary p-1", size === "sm" ? "h-9" : "h-11", className)} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          scroll={false}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "inline-flex items-center justify-center rounded-sm px-2 text-caption font-medium transition-colors duration-(--duration-hover)",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
            item.active ? "bg-fg text-fg-inverse shadow-card light:bg-brand" : "text-fg-muted hover:bg-surface-hover hover:text-fg",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
