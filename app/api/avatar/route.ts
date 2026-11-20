import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_BUCKET } from "@/features/profile/avatar";

/**
 * Serves the signed-in user's profile photo from the private bucket. The
 * `v` query is the file name, which changes on every upload, so the browser
 * may cache each version privately for a long time.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("avatar_path").eq("id", userId).maybeSingle();
  const path = profile?.avatar_path;
  if (!path) return new NextResponse(null, { status: 404 });

  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).download(path);
  if (error || !data) {
    console.error("[avatar] download", error);
    return new NextResponse(null, { status: 404 });
  }
  const current = request.nextUrl.searchParams.get("v") === path.split("/").pop();
  return new NextResponse(data, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": current ? "private, max-age=31536000, immutable" : "private, no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
