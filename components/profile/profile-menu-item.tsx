import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** P-02 Profile Menu Item: icon, title, description, chevron. */
export function ProfileMenuItem({
  href,
  icon: Icon,
  title,
  description,
  disabled,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  const content = (
    <>
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-fg-secondary">
        <Icon className="size-5" strokeWidth={1.9} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body font-medium text-fg">{title}</span>
        <span className="block truncate text-caption text-fg-muted">{description}</span>
      </span>
      {!disabled && <ChevronRight className="size-5 shrink-0 text-fg-muted" aria-hidden />}
    </>
  );
  const base = "flex min-h-16 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5";

  if (disabled) return <div className={cn(base, "opacity-60")}>{content}</div>;
  return (
    <Link
      href={href}
      className={cn(
        base,
        "transition-colors duration-(--duration-card) hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      )}
    >
      {content}
    </Link>
  );
}

/** P-03 Profile Section Header. */
export function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = `section-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="px-1 text-caption font-semibold tracking-wide text-fg-secondary uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
