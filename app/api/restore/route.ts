import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { MAX_BACKUP_BYTES, validateBackup } from "@/features/backup/validate";
import { THEME_COOKIE } from "@/lib/theme";

/**
 * Restore from a JSON backup (PRD §10.2). Re-validates on the server, then
 * runs public.restore_backup, which replaces everything in one transaction.
 * The browser shows a validated preview and requires explicit confirmation
 * before calling this.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (request.headers.get("x-confirm-restore") !== "RESTORE") {
    return NextResponse.json({ error: "Restore must be confirmed." }, { status: 400 });
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BACKUP_BYTES) return NextResponse.json({ error: "That backup file is too large (4 MB max)." }, { status: 413 });

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BACKUP_BYTES) return NextResponse.json({ error: "That backup file is too large (4 MB max)." }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "That file isn't valid JSON." }, { status: 400 });
  }

  const result = validateBackup(body);
  if (!result.ok) return NextResponse.json({ error: "The backup didn't pass validation.", details: result.errors }, { status: 422 });

  const { data, error } = await supabase.rpc("restore_backup", { p_backup: result.backup as never });
  if (error) {
    console.error("[restore]", error);
    return NextResponse.json({ error: "Restore failed and nothing was changed. Please try again." }, { status: 500 });
  }

  const appearance = result.backup.data.preferences?.appearance;
  if (appearance) {
    (await cookies()).set(THEME_COOKIE, appearance, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  }
  return NextResponse.json({ ok: true, counts: data });
}
