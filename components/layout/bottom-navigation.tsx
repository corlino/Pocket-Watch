"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { NAV_ITEMS, isActive } from "./nav-items";
import { useComposer } from "@/components/transactions/composer-context";
import { cn } from "@/lib/utils";

/**
 * G-07 Bottom Navigation with the central G-08 Add Transaction button.
 * Mobile only; floats above the iOS home indicator.
 */
export function BottomNavigation() {
  const pathname = usePathname();
  const { openCreate } = useComposer();
  const [first, second] = [NAV_ITEMS.slice(0, 2), NAV_ITEMS.slice(2)];

  const item = ({ href, label, icon: Icon }: (typeof NAV_ITEMS)[number]) => {
    const active = isActive(pathname, href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-md text-overline font-medium",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
          active ? "text-fg" : "text-fg-muted",
        )}
      >
        <Icon className={cn("size-5", active && "text-chart-yellow")} strokeWidth={1.9} aria-hidden />
        {label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex h-16 max-w-md items-center gap-1 rounded-2xl border border-border bg-background-elevated/95 px-2 shadow-float backdrop-blur-md">
        {first.map(item)}
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={openCreate}
            aria-label="Add transaction"
            className={cn(
              "-mt-7 inline-flex size-14 items-center justify-center rounded-full bg-brand text-fg-inverse shadow-float ring-4 ring-background",
              "transition-[background-color,transform] duration-(--duration-hover) hover:bg-brand-hover active:scale-95 active:bg-brand-active",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            )}
          >
            <Plus className="size-6" strokeWidth={2.2} aria-hidden />
          </button>
        </div>
        {second.map(item)}
      </div>
    </nav>
  );
}
