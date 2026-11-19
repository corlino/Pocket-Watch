"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { IconSelectionGrid } from "@/components/forms/icon-selection-grid";
import { CategoryIcon } from "./category-icon";
import { createCategory, updateCategory } from "@/features/categories/actions";
import type { Category, TransactionType } from "@/features/transactions/types";
import { CATEGORY_COLORS, CATEGORY_TILE, type CategoryColor } from "@/lib/categories";
import { cn } from "@/lib/utils";

const COLOR_NAMES: Record<CategoryColor, string> = {
  cyan: "Cyan",
  yellow: "Yellow",
  mint: "Mint",
  coral: "Coral",
  purple: "Purple",
  blue: "Blue",
  muted: "Grey",
};

const SWATCH: Record<CategoryColor, string> = {
  cyan: "bg-chart-cyan",
  yellow: "bg-chart-yellow",
  mint: "bg-chart-mint",
  coral: "bg-chart-coral",
  purple: "bg-chart-purple",
  blue: "bg-chart-blue",
  muted: "bg-chart-muted",
};

/** Create or edit a category (FR-CAT-001…004). Type is chosen only on create. */
export function CategoryForm({
  category,
  defaultType,
  onDone,
}: {
  category?: Category;
  defaultType: TransactionType;
  onDone: () => void;
}) {
  const editing = Boolean(category);
  const [name, setName] = React.useState(category?.name ?? "");
  const [type, setType] = React.useState<TransactionType>(category?.category_type ?? defaultType);
  const [icon, setIcon] = React.useState(category?.icon ?? "circle-ellipsis");
  const [color, setColor] = React.useState<CategoryColor>((category?.color as CategoryColor) ?? "cyan");
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});
  const [pending, startTransition] = React.useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Enter a name." });
      document.getElementById("category-name")?.focus();
      return;
    }
    startTransition(async () => {
      const result = editing
        ? await updateCategory({ id: category!.id, name, icon, color })
        : await createCategory({ name, type, icon, color });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Category updated" : "Category created");
      onDone();
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-md bg-surface p-3">
        <CategoryIcon icon={icon} color={color} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-fg">{name.trim() || "New category"}</p>
          <p className="text-caption text-fg-muted">{type === "income" ? "Income" : "Expense"} category</p>
        </div>
      </div>

      {!editing && (
        <FieldGroup label="Type">
          <SegmentedControl
            aria-label="Category type"
            options={[
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
            ]}
            value={type}
            onValueChange={setType}
          />
        </FieldGroup>
      )}

      <Field label="Name" id="category-name" error={errors.name} aside={<span className="text-caption text-fg-muted" aria-hidden>{name.length}/40</span>}>
        <Input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pets" autoComplete="off" autoFocus={!editing} />
      </Field>

      <FieldGroup label="Colour">
        <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={COLOR_NAMES[c]}
              onClick={() => setColor(c)}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full border-2 transition-transform duration-(--duration-hover)",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                color === c ? "scale-105 border-fg" : "border-transparent",
              )}
            >
              <span className={cn("inline-flex size-8 items-center justify-center rounded-full", SWATCH[c])}>
                {color === c && <Check className="size-4 text-fg-inverse" strokeWidth={3} aria-hidden />}
              </span>
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Icon" error={errors.icon}>
        <IconSelectionGrid value={icon} onValueChange={setIcon} tileClass={CATEGORY_TILE[color]} />
      </FieldGroup>

      <Button type="submit" size="lg" block loading={pending}>
        {editing ? "Save Changes" : "Create Category"}
      </Button>
    </form>
  );
}
