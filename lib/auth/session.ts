/**
 * Session constants shared by the proxy and the login action.
 *
 * Inactivity (PRD FR-SEC-004): the proxy refreshes an HTTP-only "last active"
 * cookie on every request with a 7-day lifetime. If it has expired — no
 * activity for 7 days — the Supabase session is ended and the user must sign
 * in again. (Supabase's own inactivity timeout is a paid-plan feature.)
 */
export const ACTIVITY_COOKIE = "pw-active";
export const INACTIVITY_LIMIT_SECONDS = 60 * 60 * 24 * 7;

export const activityCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: INACTIVITY_LIMIT_SECONDS,
};

export const LOGIN_PATH = "/login";
export const HOME_PATH = "/home";
