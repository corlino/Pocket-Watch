"use client";

import { useCallback } from "react";

/**
 * Focus an element on mount only on devices with a fine pointer that can
 * hover (mouse/trackpad, i.e. a hardware keyboard is likely). On phones and
 * tablets nothing is focused automatically, so the on-screen keyboard never
 * pops up just because a screen or sheet opened.
 */
export function useDesktopAutoFocus<T extends HTMLElement>(enabled = true) {
  return useCallback(
    (el: T | null) => {
      if (!el || !enabled) return;
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) el.focus({ preventScroll: true });
    },
    [enabled],
  );
}
