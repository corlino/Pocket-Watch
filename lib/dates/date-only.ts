/**
 * Date-only helpers. Pocket Watch stores transaction and schedule dates as
 * calendar dates (Postgres DATE) and represents them in code as ISO strings
 * ("YYYY-MM-DD"). Arithmetic uses UTC internally so it is never affected by
 * the server's or browser's local timezone or DST.
 */

export type IsoDate = string & { readonly __brand: "IsoDate" };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): value is IsoDate {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

export function toIsoDate(value: string): IsoDate {
  if (!isIsoDate(value)) throw new Error(`Invalid date: ${value}`);
  return value;
}

export function parts(date: IsoDate): { year: number; month: number; day: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { year: y, month: m, day: d };
}

export function fromParts(year: number, month: number, day: number): IsoDate {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` as IsoDate;
}

/** month is 1-12 */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const { year, month, day } = parts(date);
  const t = new Date(Date.UTC(year, month - 1, day + days));
  return fromParts(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export function compareDates(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Today's calendar date in an IANA timezone (e.g. "America/Vancouver"). */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): IsoDate {
  // en-CA formats as YYYY-MM-DD.
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return toIsoDate(formatted);
}

/** "2026-11" style month key. */
export type MonthKey = string & { readonly __brand: "MonthKey" };

export function monthKey(date: IsoDate): MonthKey {
  return date.slice(0, 7) as MonthKey;
}

export function isMonthKey(value: string): value is MonthKey {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** Inclusive first and last day of a calendar month. */
export function monthRange(key: MonthKey): { start: IsoDate; end: IsoDate } {
  const [y, m] = key.split("-").map(Number);
  return { start: fromParts(y, m, 1), end: fromParts(y, m, daysInMonth(y, m)) };
}

export function shiftMonth(key: MonthKey, delta: number): MonthKey {
  const [y, m] = key.split("-").map(Number);
  const index = y * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}` as MonthKey;
}

/** Inclusive first and last day of a calendar year. */
export function yearRange(year: number): { start: IsoDate; end: IsoDate } {
  return { start: fromParts(year, 1, 1), end: fromParts(year, 12, 31) };
}
