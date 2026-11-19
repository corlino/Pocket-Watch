import { cn } from "@/lib/utils";

/** G-05 Page Title with optional subtitle and actions (style guide §4.3). */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="text-h2 font-semibold text-fg md:text-h1">{title}</h1>
        {subtitle && <p className="mt-1 text-body text-fg-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
