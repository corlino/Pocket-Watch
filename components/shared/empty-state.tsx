import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Empty states explain what's missing and what to do next (style guide §13.2). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-secondary light:text-brand">
        <Icon className="size-6" strokeWidth={1.8} aria-hidden />
      </span>
      <p className="text-h4 font-semibold text-fg">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-body text-fg-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
