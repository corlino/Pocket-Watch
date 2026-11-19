"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { serverEnv } from "@/lib/env";
import { isIsoDate, todayInTimeZone } from "@/lib/dates/date-only";
import { parseAmountInput } from "@/lib/money";
import { CATEGORY_ICONS } from "@/lib/categories";
import type { ActionResult } from "@/features/transactions/types";

/** Budget allocations (PRD FR-BUD-003…005, 008, 009). Amounts may be zero. */

const budgetAmount = z.string().transform((raw, ctx) => {
  const parsed = parseAmountInput(raw, { allowZero: true });
  if (!parsed.ok) {
    ctx.addIssue({ code: "custom", message: parsed.error });
    return z.NEVER;
  }
  return parsed.value;
});

const createSchema = z
  .object({
    categoryId: z.uuid({ message: "Choose a category." }),
    amount: budgetAmount,
    periodType: z.enum(["monthly", "yearly"]),
    periodIdentifier: z.string(),
  })
  .refine(
    (v) => (v.periodType === "monthly" ? /^\d{4}-(0[1-9]|1[0-2])$/ : /^\d{4}$/).test(v.periodIdentifier),
    { message: "Choose a valid period.", path: ["periodIdentifier"] },
  );

function issues(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of error.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

function friendly(error: { code?: string; message: string; hint?: string | null }): ActionResult {
  if (error.code === "23505") {
    return { ok: false, error: "That category already has a budget for this period.", fieldErrors: { categoryId: "Already budgeted for this period." } };
  }
  if (error.hint === "category_archived") return { ok: false, error: "Archived categories can't receive new budgets." };
  if (error.code === "23503") return { ok: false, error: "Only expense categories can have budgets." };
  console.error("[budgets]", error);
  return { ok: false, error: "Your changes couldn't be saved. Please try again." };
}

export async function createBudget(input: z.input<typeof createSchema>): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: issues(parsed.error) };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("budgets").insert({
    category_id: parsed.data.categoryId,
    allocated_amount: parsed.data.amount as unknown as number,
    period_type: parsed.data.periodType,
    period_identifier: parsed.data.periodIdentifier,
  });
  if (error) return friendly(error);
  refresh();
  return { ok: true };
}

export async function updateBudget(id: string, amount: string): Promise<ActionResult> {
  const parsed = z.object({ id: z.uuid(), amount: budgetAmount }).safeParse({ id, amount });
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: issues(parsed.error) };
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("budgets")
    .update({ allocated_amount: parsed.data.amount as unknown as number })
    .eq("id", parsed.data.id)
    .select("id");
  if (error) return friendly(error);
  if (!data?.length) return { ok: false, error: "That budget no longer exists." };
  refresh();
  return { ok: true };
}

/** Removes only the allocation — the category and its transactions are untouched (FR-BUD-005). */
export async function deleteBudget(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Budget not found." };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) return friendly(error);
  refresh();
  return { ok: true };
}

const subscriptionSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(100, "Names can be up to 100 characters."),
  categoryId: z.uuid({ message: "Choose a category." }),
  amount: z.string().transform((raw, ctx) => {
    const parsed = parseAmountInput(raw);
    if (!parsed.ok) {
      ctx.addIssue({ code: "custom", message: parsed.error });
      return z.NEVER;
    }
    return parsed.value;
  }),
  interval: z.enum(["weekly", "monthly"]),
  renewalDate: z.string().refine(isIsoDate, "Choose a valid date."),
  icon: z.enum(Object.keys(CATEGORY_ICONS) as [string, ...string[]]).optional(),
});

/**
 * Add Subscription (component spec FR-05). A subscription is a recurring
 * expense schedule marked is_subscription; the renewal date is the next
 * charge, recorded automatically on that day (docs/decisions.md).
 */
export async function createSubscription(input: z.input<typeof subscriptionSchema>): Promise<ActionResult> {
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: issues(parsed.error) };
  const v = parsed.data;
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("create_recurring_schedule", {
    p_transaction_type: "expense",
    p_category_id: v.categoryId,
    p_amount: v.amount as unknown as number,
    p_description: v.name,
    p_notes: "",
    p_interval: v.interval,
    p_start_date: v.renewalDate,
    p_today: todayInTimeZone(serverEnv.appTimeZone),
    p_record_first: false,
    p_is_subscription: true,
    p_icon: v.icon,
  });
  if (error) return friendly(error);
  refresh();
  return { ok: true };
}
