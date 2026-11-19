/**
 * Recurrence rules (PRD FR-TRANS-012, FR-TRANS-019; TAD §7.2).
 *
 * The database function private.next_occurrence is authoritative for
 * generation; this mirror is used for previews in the UI (e.g. "next payment")
 * and is tested against the same cases.
 */
import { addDays, daysInMonth, fromParts, parts, type IsoDate } from "./date-only";

export const RECURRENCE_INTERVALS = ["weekly", "monthly"] as const;
export type RecurrenceInterval = (typeof RECURRENCE_INTERVALS)[number];

/** The anchor stored for a new schedule: the start date's day for monthly, none for weekly. */
export function anchorDayFor(interval: RecurrenceInterval, startDate: IsoDate): number | null {
  return interval === "monthly" ? parts(startDate).day : null;
}

/**
 * The occurrence after `from`.
 * Weekly: +7 days. Monthly: the anchor day in the next calendar month, clamped
 * to that month's last day — always from the anchor, never from `from`'s day.
 */
export function nextOccurrence(
  interval: RecurrenceInterval,
  anchorDay: number | null,
  from: IsoDate,
): IsoDate {
  if (interval === "weekly") return addDays(from, 7);
  if (anchorDay == null || anchorDay < 1 || anchorDay > 31) {
    throw new Error("Monthly recurrence requires an anchor day between 1 and 31");
  }
  const { year, month } = parts(from);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return fromParts(nextYear, nextMonth, Math.min(anchorDay, daysInMonth(nextYear, nextMonth)));
}

/** All occurrence dates from `next` through `today` inclusive (the catch-up set). */
export function dueOccurrences(
  interval: RecurrenceInterval,
  anchorDay: number | null,
  next: IsoDate,
  today: IsoDate,
): { dates: IsoDate[]; following: IsoDate } {
  const dates: IsoDate[] = [];
  let d = next;
  while (d <= today) {
    dates.push(d);
    d = nextOccurrence(interval, anchorDay, d);
  }
  return { dates, following: d };
}
