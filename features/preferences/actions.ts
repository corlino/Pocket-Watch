"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { APPEARANCES, THEME_COOKIE } from "@/lib/theme";
import { CURRENCIES, NUMBER_FORMATS } from "@/lib/money";
import { DATE_FORMATS } from "@/lib/formatting";
import type { ActionResult } from "@/features/transactions/types";

/**
 * Profile & preferences (PRD FR-PRO-001, 003, 004, 005). Currency is display
 * only: changing it never converts or touches stored amounts (FR-PRO-003).
 */

const themeCookie = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  // Read by the inline theme script before paint, so not HTTP-only.
  httpOnly: false,
};

export async function updateDisplayName(name: string): Promise<ActionResult> {
  const parsed = z.string().trim().min(1, "Enter a name.").max(50, "Names can be up to 50 characters.").safeParse(name);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message, fieldErrors: { displayName: parsed.error.issues[0].message } };
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("profiles").update({ display_name: parsed.data }).eq("id", userId);
  if (error) {
    console.error("[profile]", error);
    return { ok: false, error: "Your name couldn't be saved. Please try again." };
  }
  refresh();
  return { ok: true };
}

const prefsSchema = z
  .object({
    currency: z.enum(CURRENCIES),
    dateFormat: z.enum(DATE_FORMATS),
    numberFormat: z.enum(NUMBER_FORMATS),
    appearance: z.enum(APPEARANCES),
  })
  .partial();

export async function updatePreferences(input: z.input<typeof prefsSchema>): Promise<ActionResult> {
  const parsed = prefsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That option isn't available." };
  const v = parsed.data;
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("preferences")
    .update({
      ...(v.currency && { currency_display: v.currency }),
      ...(v.dateFormat && { date_format: v.dateFormat }),
      ...(v.numberFormat && { number_format: v.numberFormat }),
      ...(v.appearance && { appearance: v.appearance }),
    })
    .eq("owner_id", userId);
  if (error) {
    console.error("[preferences]", error);
    return { ok: false, error: "Your preference couldn't be saved. Please try again." };
  }
  if (v.appearance) (await cookies()).set(THEME_COOKIE, v.appearance, themeCookie);
  refresh();
  return { ok: true };
}

/** After sign-in, mirror the saved appearance into the cookie for this device. */
export async function syncThemeCookie(): Promise<void> {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("preferences").select("appearance").maybeSingle();
  if (data?.appearance) (await cookies()).set(THEME_COOKIE, data.appearance, themeCookie);
}
