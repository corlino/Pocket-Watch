import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** G-09 Card Container (style guide §7.3). */
const cardVariants = cva("rounded-lg border border-border text-fg", {
  variants: {
    variant: {
      standard: "bg-surface",
      elevated: "bg-surface-secondary shadow-card",
      flat: "bg-background-secondary",
    },
    padding: {
      none: "",
      compact: "p-3",
      default: "p-4 md:p-5",
    },
    interactive: {
      true: "cursor-pointer transition-colors duration-(--duration-card) ease-(--ease-out) hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    },
  },
  defaultVariants: { variant: "standard", padding: "default" },
});

export function Card({
  className,
  variant,
  padding,
  interactive,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return <div className={cn(cardVariants({ variant, padding, interactive }), className)} {...props} />;
}

/** G-06 Section Header with optional right-aligned action. */
export function SectionHeader({
  title,
  action,
  as: Heading = "h2",
  className,
  id,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <Heading id={id} className="text-h4 font-semibold text-fg">
        {title}
      </Heading>
      {action}
    </div>
  );
}
