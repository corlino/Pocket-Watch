/**
 * Appearance handling.
 *
 * The preference is stored in the database (preferences.appearance) and
 * mirrored to a cookie so the inline script in the root layout can apply it
 * before first paint without making the layout dynamic.
 *
 * "system" follows the phone's light/dark setting (Dark or Light). The other
 * values are themes applied directly as <html data-theme="…">.
 */

export const THEMES = ["dark", "light", "dark-red", "dark-purple", "yellow"] as const;
export type Theme = (typeof THEMES)[number];

export const APPEARANCES = [...THEMES, "system"] as const;
export type Appearance = (typeof APPEARANCES)[number];

export const THEME_COOKIE = "pw-theme";

/** Page background per theme, for the browser's address-bar colour. */
export const THEME_BACKGROUND: Record<Theme, string> = {
  dark: "#082f32",
  light: "#f1f7f6",
  "dark-red": "#511d1d",
  "dark-purple": "#24213a",
  yellow: "#c8bd49",
};

/** Runs synchronously in <head>. Default is dark (the Pocket Watch identity). */
export const THEME_SCRIPT = `(function(){try{var T=${JSON.stringify(THEMES)},B=${JSON.stringify(THEME_BACKGROUND)};var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var p=m?decodeURIComponent(m[1]):"dark";var t=p==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):(T.indexOf(p)>=0?p:"dark");var d=document.documentElement;d.setAttribute("data-theme",t);if(p!=="system")document.querySelectorAll('meta[name="theme-color"]').forEach(function(e){e.setAttribute("content",B[t])})}catch(e){}})()`;

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

export function resolveTheme(appearance: Appearance, prefersLight: boolean): Theme {
  if (appearance === "system") return prefersLight ? "light" : "dark";
  return appearance;
}

/** Client-side: apply and persist an appearance choice. */
export function applyAppearance(appearance: Appearance) {
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const theme = resolveTheme(appearance, prefersLight);
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    // "system" restores the media-specific colours from the layout.
    const media = meta.getAttribute("media") ?? "";
    const fallback = media.includes("light") ? THEME_BACKGROUND.light : THEME_BACKGROUND.dark;
    meta.setAttribute("content", appearance === "system" ? fallback : THEME_BACKGROUND[theme]);
  });
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(appearance)}; path=/; max-age=31536000; SameSite=Lax${secure}`;
}

/** Reads the appearance cookie on the client. */
export function readAppearanceCookie(): Appearance {
  const m = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`));
  const v = m ? decodeURIComponent(m[1]) : "dark";
  return (APPEARANCES as readonly string[]).includes(v) ? (v as Appearance) : "dark";
}
