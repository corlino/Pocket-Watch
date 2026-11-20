"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { ACTIVITY_COOKIE, HOME_PATH, LOGIN_PATH, activityCookieOptions } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/dal";
import { passwordProblem } from "@/lib/auth/password";
import { THEME_COOKIE } from "@/lib/theme";

export type LoginState = { error?: string } | undefined;

const loginSchema = z.object({
  password: z.string().min(1, "Enter your password.").max(200),
  next: z.string().optional(),
});

/** Only allow same-site relative paths as post-login destinations. */
function safeNext(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next === LOGIN_PATH) return HOME_PATH;
  return next;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter your password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: serverEnv.adminAuthEmail,
    password: parsed.data.password,
  });

  if (error) {
    if (error.status === 429 || error.code === "over_request_rate_limit") {
      return { error: "Too many attempts. Wait a few minutes and try again." };
    }
    if (error.code === "invalid_credentials" || error.status === 400) {
      return { error: "That password isn't right. Try again." };
    }
    return { error: "We couldn't sign you in right now. Check your connection and try again." };
  }

  const jar = await cookies();
  jar.set(ACTIVITY_COOKIE, "1", activityCookieOptions);
  // Apply the saved appearance on this device from the first page.
  const { data: prefs } = await supabase.from("preferences").select("appearance").maybeSingle();
  if (prefs?.appearance) {
    jar.set(THEME_COOKIE, prefs.appearance, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  }
  redirect(safeNext(parsed.data.next));
}

export type ChangePasswordState =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<"current" | "next" | "confirm", string>> }
  | undefined;

/**
 * FR-PRO-002 / FR-SEC-005. Re-verifies the current password before changing
 * it, so an unattended signed-in device can't be used to take over the account.
 */
export async function changePassword(_prev: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fieldErrors: NonNullable<Extract<ChangePasswordState, { ok: false }>["fieldErrors"]> = {};
  if (!current) fieldErrors.current = "Enter your current password.";
  const problem = passwordProblem(next);
  if (problem) fieldErrors.next = problem;
  else if (next === current) fieldErrors.next = "Choose a password you aren't already using.";
  if (!fieldErrors.next && confirm !== next) fieldErrors.confirm = "Passwords don't match.";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Check the highlighted fields.", fieldErrors };

  const { supabase } = await requireUser();
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: serverEnv.adminAuthEmail, password: current });
  if (verifyError) {
    if (verifyError.status === 429) return { ok: false, error: "Too many attempts. Wait a few minutes and try again." };
    return { ok: false, error: "Your current password isn't right.", fieldErrors: { current: "That password isn't right." } };
  }

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    console.error("[auth] password change failed", error);
    return { ok: false, error: "Your password couldn't be changed. Please try again." };
  }
  return { ok: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(ACTIVITY_COOKIE);
  redirect(LOGIN_PATH);
}
