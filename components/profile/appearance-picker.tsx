"use client";

import * as React from "react";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";
import { toast } from "sonner";
import { updatePreferences } from "@/features/preferences/actions";
import { applyAppearance, type Appearance, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Appearance; label: string; description: string; icon: typeof Moon }[] = [
  { value: "dark", label: "Dark", description: "The Pocket Watch default", icon: Moon },
  { value: "light", label: "Light", description: "Pale surfaces, dark text", icon: Sun },
  { value: "system", label: "System", description: "Follow your phone's light or dark setting", icon: Monitor },
  { value: "dark-red", label: "Ruby", description: "Deep red surfaces, rose accent", icon: Palette },
  { value: "dark-purple", label: "Sugilite", description: "Deep purple surfaces, lavender accent", icon: Palette },
  { value: "yellow", label: "Citrine", description: "Golden surfaces, dark text", icon: Palette },
];

/** Mini preview of a theme, drawn with that theme's own tokens. */
function Preview({ theme }: { theme: Theme }) {
  return (
    <div data-theme={theme} aria-hidden className="flex h-16 w-full min-w-0 flex-col gap-1.5 overflow-hidden rounded-md border border-border bg-background p-2">
      <div className="h-2 w-2/5 rounded-full bg-fg" />
      <div className="flex flex-1 gap-1.5">
        <div className="min-w-0 flex-1 rounded-sm bg-surface p-1">
          <div className="h-1.5 w-3/5 rounded-full bg-income" />
        </div>
        <div className="min-w-0 flex-1 rounded-sm bg-surface p-1">
          <div className="h-1.5 w-3/5 rounded-full bg-expense" />
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-brand" />
    </div>
  );
}

/** FR-PRO-005 plus extra themes. Applies instantly, saved for every device. */
export function AppearancePicker({ initial }: { initial: Appearance }) {
  const [value, setValue] = React.useState<Appearance>(initial);
  const [, startTransition] = React.useTransition();

  const choose = (next: Appearance) => {
    if (next === value) return;
    const previous = value;
    setValue(next);
    applyAppearance(next);
    startTransition(async () => {
      const r = await updatePreferences({ appearance: next });
      if (!r.ok) {
        setValue(previous);
        applyAppearance(previous);
        toast.error(r.error);
      }
    });
  };

  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {OPTIONS.map(({ value: v, label, description, icon: Icon }) => {
        const selected = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => choose(v)}
            className={cn(
              "flex flex-col gap-3 rounded-lg border p-3 text-left transition-colors duration-(--duration-hover)",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected ? "border-brand bg-brand-soft" : "border-border bg-surface hover:bg-surface-hover",
            )}
          >
            {v === "system" ? (
              <div className="grid grid-cols-2 gap-1.5">
                <Preview theme="dark" />
                <Preview theme="light" />
              </div>
            ) : (
              <Preview theme={v} />
            )}
            <span className="flex items-start gap-2.5">
              <Icon className="mt-0.5 hidden size-[18px] shrink-0 text-fg-secondary min-[360px]:block" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-medium text-fg">{label}</span>
                <span className="block text-caption text-fg-muted">{description}</span>
              </span>
              {selected && <Check className="size-5 shrink-0 text-brand" strokeWidth={2.4} aria-hidden />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
