"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categories";
import type { ActionResult } from "@/features/transactions/types";

/**
 * Category management (PRD FR-PRO-006, FR-CAT-001…013).
 * Type is fixed at creation — existing transactions and budgets depend on it.
 * Categories are archived, never hard-deleted, so history stays intact.
 */

const nameSchema = z
  .string()
  .trim()
  .min(1, "Enter a name.")
  .max(40, "Names can be up to 40 characters.");

const iconSchema = z.enum(Object.keys(CATEGORY_ICONS) as [string, ...string[]], { message: "Choose an icon." });
const colorSchema = z.enum(CATEGORY_COLORS, { message: "Choose a colour." });

const createSchema = z.object({
  name: nameSchema,
  type: z.enum(["income", "expense"]),
  icon: iconSchema,
  color: colorSchema,
});

const updateSchema = z.object({
  id: z.uuid(),
  name: nameSchema,
  icon: iconSchema,
  color: colorSchema,
});

export type CategoryCreateInput = z.input<typeof createSchema>;
export type CategoryUpdateInput = z.input<typeof updateSchema>;

function issues(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

function friendly(error: { code?: string; message: string }): ActionResult {
  if (error.code === "23505") {
    return { ok: false, error: "A category with that name already exists.", fieldErrors: { name: "That name is already used for this type." } };
  }
  console.error("[categories]", error);
  return { ok: false, error: "Your changes couldn't be saved. Please try again." };
}

export async function createCategory(input: CategoryCreateInput): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: issues(parsed.error) };
  const { supabase } = await requireUser();

  // New categories go to the end of their type's list.
  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("category_type", parsed.data.type)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    category_type: parsed.data.type,
    icon: parsed.data.icon,
    color: parsed.data.color,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  if (error) return friendly(error);
  refresh();
  return { ok: true };
}

/** Renames update everywhere automatically — transactions reference the id (FR-CAT-012). */
export async function updateCategory(input: CategoryUpdateInput): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: issues(parsed.error) };
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("categories")
    .update({ name: parsed.data.name, icon: parsed.data.icon, color: parsed.data.color })
    .eq("id", parsed.data.id)
    .select("id");
  if (error) return friendly(error);
  if (!data?.length) return { ok: false, error: "That category no longer exists." };
  refresh();
  return { ok: true };
}

export async function setCategoryArchived(id: string, archived: boolean): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Category not found." };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("categories").update({ is_archived: archived }).eq("id", id);
  if (error) return friendly(error);
  refresh();
  return { ok: true };
}
