/**
 * Central category icon + colour registry (component spec F-14, §11.4).
 * Categories store an icon identifier and a palette key; components resolve
 * them here instead of hard-coding icons.
 */
import {
  BadgeDollarSign,
  Briefcase,
  CarFront,
  ChartLine,
  CircleEllipsis,
  CirclePlus,
  Coffee,
  Dumbbell,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  Music,
  PawPrint,
  PiggyBank,
  Plane,
  Repeat,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Ticket,
  Tv,
  Utensils,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS = {
  house: House,
  "shopping-basket": ShoppingBasket,
  "car-front": CarFront,
  utensils: Utensils,
  ticket: Ticket,
  "shopping-bag": ShoppingBag,
  zap: Zap,
  "heart-pulse": HeartPulse,
  sparkles: Sparkles,
  repeat: Repeat,
  plane: Plane,
  "graduation-cap": GraduationCap,
  "circle-ellipsis": CircleEllipsis,
  briefcase: Briefcase,
  laptop: Laptop,
  "chart-line": ChartLine,
  gift: Gift,
  "badge-dollar-sign": BadgeDollarSign,
  "circle-plus": CirclePlus,
  "piggy-bank": PiggyBank,
  coffee: Coffee,
  dumbbell: Dumbbell,
  "gamepad-2": Gamepad2,
  globe: Globe,
  music: Music,
  "paw-print": PawPrint,
  shirt: Shirt,
  smartphone: Smartphone,
  tv: Tv,
  wifi: Wifi,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof CATEGORY_ICONS;

export function categoryIcon(name: string | null | undefined): LucideIcon {
  return (name && CATEGORY_ICONS[name as CategoryIconName]) || CircleEllipsis;
}

export const CATEGORY_COLORS = ["cyan", "yellow", "mint", "coral", "purple", "blue", "muted"] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

/** Tinted icon tile classes per palette key (full class names for Tailwind). */
export const CATEGORY_TILE: Record<CategoryColor, string> = {
  cyan: "bg-chart-cyan/15 text-chart-cyan",
  yellow: "bg-chart-yellow/15 text-chart-yellow",
  mint: "bg-chart-mint/15 text-chart-mint",
  coral: "bg-chart-coral/15 text-chart-coral",
  purple: "bg-chart-purple/15 text-chart-purple",
  blue: "bg-chart-blue/15 text-chart-blue",
  muted: "bg-chart-muted/20 text-fg-secondary",
};

export function categoryTile(color: string | null | undefined): string {
  return CATEGORY_TILE[(color as CategoryColor) ?? "muted"] ?? CATEGORY_TILE.muted;
}
