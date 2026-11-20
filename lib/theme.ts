/**
 * Appearance handling.
 *
 * The preference ("dark" | "light" | "system") is stored in the database
 * (preferences.appearance) and mirrored to a cookie so the inline script in
 * the root layout can apply it before first paint without making the layout
 * dynamic.
 */

export const APPEARANCES = ["dark", "light", "system"] as const;
export type Appearance = (typeof APPEARANCES)[number];

export const THEME_COOKIE = "pw-theme";

/** Runs synchronously in <head>. Default is dark (the Pocket Watch identity). */
export const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var p=m?decodeURIComponent(m[1]):"dark";var t=p==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):(p==="light"?"light":"dark");document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function resolveTheme(appearance: Appearance, prefersLight: boolean): "dark" | "light" {
  if (appearance === "system") return prefersLight ? "light" : "dark";
  return appearance;
}

/** Client-side: apply and persist an appearance choice. */
export function applyAppearance(appearance: Appearance) {
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  document.documentElement.setAttribute("data-theme", resolveTheme(appearance, prefersLight));
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(appearance)}; path=/; max-age=31536000; SameSite=Lax${secure}`;
}

/** Reads the appearance cookie on the client. */
export function readAppearanceCookie(): Appearance {
  const m = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`));
  const v = m ? decodeURIComponent(m[1]) : "dark";
  return (APPEARANCES as readonly string[]).includes(v) ? (v as Appearance) : "dark";
}
