import { ChartNoAxesCombined, House, UserRound, Wallet, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** The four primary destinations (PRD §4), in order. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: House },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home" || pathname.startsWith("/transactions");
  return pathname === href || pathname.startsWith(`${href}/`);
}
