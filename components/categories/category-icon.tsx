import { createElement } from "react";
import { categoryIcon, categoryTile } from "@/lib/categories";
import { cn } from "@/lib/utils";

/** F-14 Category Icon: Lucide outline icon on a category-tinted tile. */
export function CategoryIcon({
  icon,
  color,
  size = "md",
  className,
}: {
  icon: string | null | undefined;
  color: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md",
        size === "sm" && "size-8 [&_svg]:size-4",
        size === "md" && "size-10 [&_svg]:size-5",
        size === "lg" && "size-12 [&_svg]:size-6",
        categoryTile(color),
        className,
      )}
    >
      {createElement(categoryIcon(icon), { strokeWidth: 1.9 })}
    </span>
  );
}
