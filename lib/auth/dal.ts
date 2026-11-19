import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_PATH } from "./session";

/**
 * Data Access Layer auth check. Call at the start of every page, Server Action
 * and data loader that touches financial data. The proxy is only an optimistic
 * redirect; this (plus RLS in the database) is the real enforcement.
 */
export const requireUser = cache(async () => {
  // Auth is per-request by definition; never let it run during prerendering
  // (the token check reads the clock).
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) redirect(LOGIN_PATH);
  return { userId: data.claims.sub, supabase };
});
