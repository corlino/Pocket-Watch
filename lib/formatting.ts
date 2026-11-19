/**
 * Centralised date display (component spec §11.3). Money formatting lives in
 * lib/money.ts. Neither ever changes stored values.
 */
import { addDays, parts, type IsoDate } from "@/lib/dates/date-only";

export const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as const;
export type DateFormat = (typeof DATE_FORMATS)[number];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatDate(date: IsoDate, format: DateFormat = "MM/DD/YYYY"): string {
  const { year, month, day } = parts(date);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  if (format === "DD/MM/YYYY") return `${dd}/${mm}/${year}`;
  if (format === "YYYY-MM-DD") return date;
  return `${mm}/${dd}/${year}`;
}

/** "November 2026" */
export function formatMonthYear(date: IsoDate): string {
  const { year, month } = parts(date);
  return `${MONTHS[month - 1]} ${year}`;
}

/** "Thursday, November 19" — or "Today" / "Yesterday" relative to `today`. */
export function formatDayHeading(date: IsoDate, today: IsoDate): string {
  if (date === today) return "Today";
  if (date === addDays(today, -1)) return "Yesterday";
  const { year, month, day } = parts(date);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  const thisYear = parts(today).year;
  return `${weekday}, ${MONTHS[month - 1]} ${day}${year === thisYear ? "" : `, ${year}`}`;
}

/** Long, unambiguous form for screen readers: "November 19, 2026". */
export function formatDateLong(date: IsoDate): string {
  const { year, month, day } = parts(date);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
