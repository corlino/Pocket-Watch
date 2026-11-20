import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ACTIVITY_COOKIE, HOME_PATH, LOGIN_PATH, activityCookieOptions } from "@/lib/auth/session";

/**
 * Runs before every app request:
 * 1. Refreshes the Supabase session cookie when needed.
 * 2. Signs out after 7 days of inactivity.
 * 3. Optimistically redirects signed-out visitors to /login (real
 *    enforcement happens in lib/auth/dal.ts and database RLS).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  let signedIn = Boolean(data?.claims?.sub);

  if (signedIn && !request.cookies.has(ACTIVITY_COOKIE)) {
    // Inactive for longer than the limit: end the session.
    await supabase.auth.signOut({ scope: "local" });
    signedIn = false;
  }

  const path = request.nextUrl.pathname;
  const isLogin = path === LOGIN_PATH;

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = target;
    url.search = target === LOGIN_PATH && !isLogin && path !== "/" ? `?next=${encodeURIComponent(path)}` : "";
    const redirect = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!signedIn && !isLogin) return redirectTo(LOGIN_PATH);
  if (signedIn && (isLogin || path === "/")) {
    const r = redirectTo(HOME_PATH);
    r.cookies.set(ACTIVITY_COOKIE, "1", activityCookieOptions);
    return r;
  }

  if (signedIn) response.cookies.set(ACTIVITY_COOKIE, "1", activityCookieOptions);
  // Never let shared caches store authenticated pages. The profile photo
  // route sets its own private, per-version caching (the URL changes on
  // every upload), so the browser doesn't re-download it on every page.
  if (path !== "/api/avatar") response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets, PWA files and the cron endpoint
    // (which authenticates with its own secret).
    "/((?!_next/static|_next/image|api/cron|brand/|manifest-icons/|manifest.webmanifest|icon.png|apple-icon.png|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
