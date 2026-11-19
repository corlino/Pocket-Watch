import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { todayInTimeZone } from "@/lib/dates/date-only";

/**
 * Daily recurring-transaction processing (TAD §7.1), invoked by Vercel Cron.
 * Generation, catch-up, schedule advancement and duplicate prevention all
 * happen atomically in public.process_recurring_schedules. Safe to retry.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = todayInTimeZone(serverEnv.appTimeZone);
  const { data, error } = await createAdminClient().rpc("process_recurring_schedules", { p_today: today });

  if (error) {
    console.error("[cron] recurring processing failed", error);
    return NextResponse.json({ ok: false, date: today, error: "Processing failed" }, { status: 500 });
  }

  const result = data?.[0] ?? { schedules_processed: 0, transactions_created: 0 };
  console.info("[cron] recurring processing", { date: today, ...result });
  return NextResponse.json({ ok: true, date: today, ...result });
}

function isAuthorized(header: string | null): boolean {
  const expected = Buffer.from(`Bearer ${serverEnv.cronSecret}`);
  const actual = Buffer.from(header ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
