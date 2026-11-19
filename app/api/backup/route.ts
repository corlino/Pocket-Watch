import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildBackup } from "@/features/backup/export";
import { serverEnv } from "@/lib/env";
import { todayInTimeZone } from "@/lib/dates/date-only";

/** Download a complete JSON backup. Authenticated administrator only. */
export async function GET() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const backup = await buildBackup(supabase, now);
    const filename = `pocket-watch-backup-${todayInTimeZone(serverEnv.appTimeZone, now)}.json`;
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[backup]", error);
    return NextResponse.json({ error: "Backup failed. Please try again." }, { status: 500 });
  }
}
