import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * G-11 Primary / G-12 Secondary / G-13 Icon / destructive buttons.
 * One component, variants only (style guide §7.1, §18 rule 4).
 */
const buttonVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold",
    "transition-[background-color,color,border-color,transform] duration-(--duration-hover) ease-(--ease-out)",
    "active:scale-[0.98] active:duration-(--duration-press)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand text-fg-inverse hover:bg-brand-hover active:bg-brand-active",
        secondary: "border border-border bg-surface-secondary text-fg hover:bg-surface-hover",
        ghost: "text-fg-secondary hover:bg-surface-hover hover:text-fg",
        destructive: "border border-expense/30 bg-expense/12 text-expense hover:bg-expense/20",
        "destructive-solid": "bg-expense text-fg-inverse hover:bg-expense/90",
        link: "h-auto px-0 font-medium text-brand underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-caption",
        md: "h-11 px-4 text-body",
        lg: "h-12 px-5 text-body",
        icon: "size-10 rounded-md",
        "icon-sm": "size-9 rounded-md [&_svg:not([class*='size-'])]:size-4",
      },
      block: { true: "w-full" },
    },
    compoundVariants: [{ variant: "link", class: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, disables the button and announces busy state. */
    loading?: boolean;
  };

function Button({ className, variant, size, block, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <LoaderCircle className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
