"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { NAV_ITEMS, isActive } from "./nav-items";
import { BrandMark } from "@/components/shared/brand-mark";
import { useComposer } from "@/components/transactions/composer-context";
import { logout } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

/**
 * Desktop/tablet navigation (style guide §8.2). Compact icon rail from md,
 * full 240px sidebar from lg.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { openCreate } = useComposer();

  return (
    <aside className="sticky top-0 hidden h-dvh w-sidebar-collapsed shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 md:flex lg:w-sidebar lg:px-4">
      <Link href="/home" className="mb-8 flex items-center gap-3 px-1.5 lg:px-2" aria-label="Pocket Watch home">
        <BrandMark size={36} />
        <span className="hidden text-h4 font-semibold text-fg lg:inline">Pocket Watch</span>
      </Link>

      <button
        type="button"
        onClick={openCreate}
        className={cn(
          "mb-6 flex h-11 items-center justify-center gap-2 rounded-md bg-brand font-semibold text-fg-inverse shadow-card",
          "transition-colors duration-(--duration-hover) hover:bg-brand-hover active:bg-brand-active",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        )}
      >
        <Plus className="size-5" aria-hidden />
        <span className="sr-only lg:not-sr-only">Add Transaction</span>
      </button>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex h-11 items-center justify-center gap-3 rounded-md px-3 text-body font-medium transition-colors duration-(--duration-hover) lg:justify-start",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active ? "bg-sidebar-accent text-fg" : "text-fg-muted hover:bg-surface-hover/60 hover:text-fg",
              )}
            >
              {active && <span aria-hidden className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-brand" />}
              <Icon className={cn("size-5 shrink-0", active && "text-brand")} strokeWidth={1.9} aria-hidden />
              <span className="sr-only lg:not-sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-3 rounded-md px-3 text-body font-medium text-fg-muted transition-colors hover:bg-surface-hover/60 hover:text-fg focus-visible:outline-2 focus-visible:outline-brand lg:justify-start"
        >
          <LogOut className="size-5 shrink-0" strokeWidth={1.9} aria-hidden />
          <span className="sr-only lg:not-sr-only">Sign out</span>
        </button>
      </form>
    </aside>
  );
}
