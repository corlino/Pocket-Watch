/**
 * Analytics filters (PRD FR-AN-006): date range, month, year, category and
 * transaction type. State lives in the URL so filters survive refresh and
 * can be shared between sections.
 */
import {
  isIsoDate,
  isMonthKey,
  monthKey,
  monthRange,
  parts,
  shiftMonth,
  yearRange,
  type IsoDate,
  type MonthKey,
} from "@/lib/dates/date-only";
import { formatDateLong, formatMonthYear } from "@/lib/formatting";

export const RANGE_PRESETS = ["6m", "12m", "ytd", "month", "year", "custom"] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export type AnalyticsFilters = {
  range: RangePreset;
  month?: MonthKey;
  year?: number;
  from?: IsoDate;
  to?: IsoDate;
  categoryId?: string;
  type: "all" | "income" | "expense";
};

export type ResolvedRange = { start: IsoDate; end: IsoDate; months: MonthKey[]; label: string };

const MAX_MONTHS = 60;

export function parseAnalyticsFilters(params: Record<string, string | string[] | undefined>): AnalyticsFilters {
  const get = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const rangeParam = get("range");
  const range: RangePreset = (RANGE_PRESETS as readonly string[]).includes(rangeParam ?? "") ? (rangeParam as RangePreset) : "6m";
  const f: AnalyticsFilters = { range, type: "all" };
  const month = get("month");
  if (month && isMonthKey(month)) f.month = month;
  const year = Number(get("year"));
  if (Number.isInteger(year) && year > 1900 && year < 2200) f.year = year;
  const from = get("from");
  if (from && isIsoDate(from)) f.from = from;
  const to = get("to");
  if (to && isIsoDate(to)) f.to = to;
  const category = get("category");
  if (category && /^[0-9a-f-]{36}$/i.test(category)) f.categoryId = category;
  const type = get("type");
  if (type === "income" || type === "expense") f.type = type;
  return f;
}

function monthsBetween(start: IsoDate, end: IsoDate): MonthKey[] {
  const out: MonthKey[] = [];
  let m = monthKey(start);
  const last = monthKey(end);
  while (m <= last && out.length < MAX_MONTHS) {
    out.push(m);
    m = shiftMonth(m, 1);
  }
  return out;
}

/** Turns filters into a concrete inclusive date range and the months it covers. */
export function resolveRange(f: AnalyticsFilters, today: IsoDate): ResolvedRange {
  const current = monthKey(today);
  const lastN = (n: number, label: string): ResolvedRange => {
    const first = shiftMonth(current, -(n - 1));
    const months = Array.from({ length: n }, (_, i) => shiftMonth(first, i));
    return { start: monthRange(first).start, end: monthRange(current).end, months, label };
  };

  switch (f.range) {
    case "12m":
      return lastN(12, "Last 12 months");
    case "ytd": {
      const y = parts(today).year;
      const first = `${y}-01` as MonthKey;
      return { start: yearRange(y).start, end: monthRange(current).end, months: monthsBetween(monthRange(first).start, today), label: `${y} to date` };
    }
    case "month": {
      const m = f.month ?? current;
      return { ...monthRange(m), months: [m], label: formatMonthYear(monthRange(m).start) };
    }
    case "year": {
      const y = f.year ?? parts(today).year;
      const r = yearRange(y);
      return { ...r, months: monthsBetween(r.start, r.end), label: String(y) };
    }
    case "custom": {
      if (!f.from || !f.to) return lastN(6, "Last 6 months");
      const [start, end] = f.from <= f.to ? [f.from, f.to] : [f.to, f.from];
      const months = monthsBetween(start, end);
      // Never exceed the cap: clamp the end to the last allowed month.
      const clampedEnd = months.length === MAX_MONTHS && monthKey(end) > months[months.length - 1] ? monthRange(months[months.length - 1]).end : end;
      return { start, end: clampedEnd, months, label: `${formatDateLong(start)} – ${formatDateLong(clampedEnd)}` };
    }
    default:
      return lastN(6, "Last 6 months");
  }
}
