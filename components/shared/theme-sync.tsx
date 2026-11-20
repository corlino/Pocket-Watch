"use client";

import { useEffect } from "react";
import { readAppearanceCookie, resolveTheme } from "@/lib/theme";

/**
 * Keeps the theme in step with the phone's light/dark setting while
 * "System" is selected (the inline script handles the first paint).
 */
export function ThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const appearance = readAppearanceCookie();
      if (appearance === "system") document.documentElement.setAttribute("data-theme", resolveTheme("system", mq.matches));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return null;
}
