/**
 * Figures must never be truncated or overlap their neighbours. These helpers
 * step the font size down as a formatted value gets longer, so large amounts
 * still fit two- and three-column figure rows on a 320px phone. As a last
 * resort the value may wrap (overflow-wrap: anywhere) rather than overlap.
 *
 * Typical personal amounts ("$12,345.67", 10 characters) keep the full size.
 */

const WRAP = "whitespace-normal [overflow-wrap:anywhere]";

/** Large figures: KPI cards, budget summary (normally h3 → h2). */
export function figureSizeLg(text: string): string {
  const n = text.length;
  if (n <= 10) return `text-h3 md:text-h2 ${WRAP}`;
  if (n <= 13) return `text-body-lg md:text-h3 ${WRAP}`;
  return `text-body md:text-h4 ${WRAP}`;
}

/** Medium figures in tight rows (3-up summaries, h3 by default). */
export function figureSizeMd(text: string): string {
  const n = text.length;
  if (n <= 8) return `text-h3 ${WRAP}`;
  if (n <= 11) return `text-body-lg ${WRAP}`;
  return `text-body ${WRAP}`;
}
