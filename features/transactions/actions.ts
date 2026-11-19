"use server";

// Money note: amounts are validated MoneyString values ("12.34"). They are sent
// to Supabase as strings — the generated types say `number` for NUMERIC, hence
// the casts — so no JavaScript floating-point conversion ever happens.
import { refresh } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { serverEnv } from "@/lib/env";
import { parts, todayInTimeZone } from "@/lib/dates/date-only";
import { fieldErrors, scheduleUpdateSchema, transactionInputSchema, type ScheduleUpdateInput, type TransactionInput } from "./schema";
import type { ActionResult } from "./types";

type PgError = { code?: string; message: string; hint?: string | null };

/** Turn database errors into plain-language messages (style guide §13.3). */
function friendly(error: PgError): ActionResult {
  if (error.hint === "category_archived") {
    return { ok: false, error: "That category is archived. Choose another one.", fieldErrors: { categoryId: "This category is archived." } };
  }
  if (error.code === "23503") {
    return { ok: false, error: "That category doesn't match the transaction type.", fieldErrors: { categoryId: "Choose a category for this type." } };
  }
  if (error.code === "23514") return { ok: false, error: "Some values aren't valid. Check the form and try again." };
  console.error("[transactions]", error);
  return { ok: false, error: "Your changes couldn't be saved. Please try again." };
}

const idSchema = z.uuid();

export async function createTransaction(input: TransactionInput): Promise<ActionResult> {
  const parsed = transactionInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const v = parsed.data;
  const { supabase } = await requireUser();

  if (v.recurring && v.interval) {
    const { error } = await supabase.rpc("create_recurring_schedule", {
      p_transaction_type: v.type,
      p_category_id: v.categoryId,
      // Sent as an exact decimal string; Postgres casts it to NUMERIC with no float step.
      p_amount: v.amount as unknown as number,
      p_description: v.description ?? "",
      p_notes: v.notes ?? "",
      p_interval: v.interval,
      p_start_date: v.date,
      p_today: todayInTimeZone(serverEnv.appTimeZone),
      p_record_first: true,
      p_is_subscription: false,
    });
    if (error) return friendly(error);
  } else {
    const { error } = await supabase.from("transactions").insert({
      transaction_type: v.type,
      category_id: v.categoryId,
      amount: v.amount as unknown as number,
      description: v.description,
      notes: v.notes,
      transaction_date: v.date,
    });
    if (error) return friendly(error);
  }

  refresh();
  return { ok: true };
}

/** Edits one transaction only — never its recurring schedule (FR-TRANS-016). */
export async function updateTransaction(id: string, input: TransactionInput): Promise<ActionResult> {
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Transaction not found." };
  const parsed = transactionInputSchema.safeParse({ ...input, recurring: false });
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const v = parsed.data;
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("transactions")
    .update({
      transaction_type: v.type,
      category_id: v.categoryId,
      amount: v.amount as unknown as number,
      description: v.description,
      notes: v.notes,
      transaction_date: v.date,
    })
    .eq("id", id)
    .select("id");
  if (error) return friendly(error);
  if (!data?.length) return { ok: false, error: "That transaction no longer exists." };

  refresh();
  return { ok: true };
}

/** Deletes one transaction. Its recurring schedule keeps running (FR-TRANS-017). */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Transaction not found." };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return friendly(error);
  refresh();
  return { ok: true };
}

/**
 * Edits a schedule. Only future occurrences change (FR-TRANS-016): past
 * transactions are separate rows and are not touched.
 */
export async function updateSchedule(input: ScheduleUpdateInput): Promise<ActionResult> {
  const parsed = scheduleUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const v = parsed.data;
  const { supabase } = await requireUser();

  const { data: current, error: readError } = await supabase
    .from("recurring_schedules")
    .select("id, next_scheduled_date, recurrence_interval, anchor_day_of_month")
    .eq("id", v.scheduleId)
    .maybeSingle();
  if (readError) return friendly(readError);
  if (!current) return { ok: false, error: "That recurring schedule no longer exists." };

  // Switching interval re-anchors on the next scheduled date.
  const anchor =
    v.interval === current.recurrence_interval
      ? current.anchor_day_of_month
      : v.interval === "monthly"
        ? parts(current.next_scheduled_date as never).day
        : null;

  const { error } = await supabase
    .from("recurring_schedules")
    .update({
      category_id: v.categoryId,
      amount: v.amount as unknown as number,
      description: v.description,
      notes: v.notes,
      recurrence_interval: v.interval,
      anchor_day_of_month: anchor,
    })
    .eq("id", v.scheduleId);
  if (error) return friendly(error);

  refresh();
  return { ok: true };
}

/** Stops future generation; history is preserved (FR-TRANS-015). */
export async function disableSchedule(scheduleId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(scheduleId).success) return { ok: false, error: "Schedule not found." };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("recurring_schedules").update({ is_active: false }).eq("id", scheduleId);
  if (error) return friendly(error);
  refresh();
  return { ok: true };
}

/** Bell opened: everything up to now counts as seen. */
export async function markNotificationsSeen(): Promise<ActionResult> {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("profiles").update({ notifications_seen_at: new Date().toISOString() }).eq("id", userId);
  if (error) return friendly(error);
  refresh();
  return { ok: true };
}
