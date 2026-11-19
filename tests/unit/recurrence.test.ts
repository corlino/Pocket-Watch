import { describe, expect, it } from "vitest";
import { anchorDayFor, dueOccurrences, nextOccurrence } from "@/lib/dates/recurrence";
import { addDays, monthRange, shiftMonth, todayInTimeZone, toIsoDate, type MonthKey } from "@/lib/dates/date-only";

const d = toIsoDate;

describe("weekly recurrence", () => {
  it("adds seven calendar days", () => {
    expect(nextOccurrence("weekly", null, d("2026-11-19"))).toBe("2026-11-26");
  });
  it("crosses month and year boundaries", () => {
    expect(nextOccurrence("weekly", null, d("2026-12-29"))).toBe("2027-01-05");
  });
  it("is unaffected by DST changes", () => {
    // Vancouver DST ends 2026-11-01.
    expect(nextOccurrence("weekly", null, d("2026-10-28"))).toBe("2026-11-04");
  });
});

describe("monthly recurrence (FR-TRANS-019)", () => {
  it("keeps the same day when it exists", () => {
    expect(nextOccurrence("monthly", 15, d("2026-01-15"))).toBe("2026-02-15");
  });
  it("clamps Jan 31 to Feb 28 in a common year", () => {
    expect(nextOccurrence("monthly", 31, d("2026-01-31"))).toBe("2026-02-28");
  });
  it("clamps to Feb 29 in a leap year", () => {
    expect(nextOccurrence("monthly", 31, d("2028-01-31"))).toBe("2028-02-29");
  });
  it("returns to the anchor after a short month (Feb 28 → Mar 31)", () => {
    expect(nextOccurrence("monthly", 31, d("2026-02-28"))).toBe("2026-03-31");
  });
  it("walks a 31st anchor through a full year without drifting", () => {
    let date = d("2026-01-31");
    const seen: string[] = [date];
    for (let i = 0; i < 12; i++) {
      date = nextOccurrence("monthly", 31, date);
      seen.push(date);
    }
    expect(seen).toEqual([
      "2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30", "2026-05-31", "2026-06-30",
      "2026-07-31", "2026-08-31", "2026-09-30", "2026-10-31", "2026-11-30", "2026-12-31", "2027-01-31",
    ]);
  });
  it("handles a 30th anchor in February", () => {
    expect(nextOccurrence("monthly", 30, d("2026-01-30"))).toBe("2026-02-28");
    expect(nextOccurrence("monthly", 30, d("2026-02-28"))).toBe("2026-03-30");
  });
  it("rolls December into January", () => {
    expect(nextOccurrence("monthly", 5, d("2026-12-05"))).toBe("2027-01-05");
  });
  it("requires an anchor", () => {
    expect(() => nextOccurrence("monthly", null, d("2026-01-01"))).toThrow();
  });
  it("derives the anchor from the start date", () => {
    expect(anchorDayFor("monthly", d("2026-01-31"))).toBe(31);
    expect(anchorDayFor("weekly", d("2026-01-31"))).toBeNull();
  });
});

describe("missed occurrence catch-up (FR-TRANS-018)", () => {
  it("returns every missed weekly date with original dates", () => {
    const { dates, following } = dueOccurrences("weekly", null, d("2026-11-01"), d("2026-11-19"));
    expect(dates).toEqual(["2026-11-01", "2026-11-08", "2026-11-15"]);
    expect(following).toBe("2026-11-22");
  });
  it("includes an occurrence due today", () => {
    const { dates } = dueOccurrences("weekly", null, d("2026-11-19"), d("2026-11-19"));
    expect(dates).toEqual(["2026-11-19"]);
  });
  it("returns nothing for a future schedule", () => {
    const { dates, following } = dueOccurrences("monthly", 1, d("2026-12-01"), d("2026-11-19"));
    expect(dates).toEqual([]);
    expect(following).toBe("2026-12-01");
  });
});

describe("date-only helpers", () => {
  it("computes month ranges including leap years", () => {
    expect(monthRange("2026-11" as MonthKey)).toEqual({ start: "2026-11-01", end: "2026-11-30" });
    expect(monthRange("2028-02" as MonthKey)).toEqual({ start: "2028-02-01", end: "2028-02-29" });
  });
  it("shifts months across years", () => {
    expect(shiftMonth("2026-01" as MonthKey, -1)).toBe("2025-12");
    expect(shiftMonth("2026-12" as MonthKey, 1)).toBe("2027-01");
  });
  it("adds negative days", () => {
    expect(addDays(d("2026-03-01"), -1)).toBe("2026-02-28");
  });
  it("uses the app timezone for today", () => {
    // 2026-11-20 05:00 UTC is still Nov 19 in Vancouver (UTC-8).
    expect(todayInTimeZone("America/Vancouver", new Date("2026-11-20T05:00:00Z"))).toBe("2026-11-19");
    expect(todayInTimeZone("America/Vancouver", new Date("2026-11-20T08:30:00Z"))).toBe("2026-11-20");
  });
  it("rejects impossible dates", () => {
    expect(() => toIsoDate("2026-02-30")).toThrow();
    expect(() => toIsoDate("2026-13-01")).toThrow();
  });
});
