"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { ACTIVITY_COOKIE, HOME_PATH, LOGIN_PATH, activityCookieOptions } from "@/lib/auth/session";

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

  (await cookies()).set(ACTIVITY_COOKIE, "1", activityCookieOptions);
  redirect(safeNext(parsed.data.next));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(ACTIVITY_COOKIE);
  redirect(LOGIN_PATH);
}
