import { describe, expect, it } from "vitest";
import { parseAnalyticsFilters, resolveRange } from "@/features/analytics/filters";
import { toIsoDate } from "@/lib/dates/date-only";

const today = toIsoDate("2026-11-19");

describe("analytics range resolution", () => {
  it("defaults to the last 6 calendar months including this one", () => {
    const r = resolveRange(parseAnalyticsFilters({}), today);
    expect(r).toMatchObject({ start: "2026-06-01", end: "2026-11-30", label: "Last 6 months" });
    expect(r.months).toEqual(["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]);
  });
  it("supports 12 months across a year boundary", () => {
    const r = resolveRange(parseAnalyticsFilters({ range: "12m" }), today);
    expect(r.start).toBe("2025-12-01");
    expect(r.months).toHaveLength(12);
  });
  it("supports year to date, a single month and a full year", () => {
    expect(resolveRange(parseAnalyticsFilters({ range: "ytd" }), today)).toMatchObject({ start: "2026-01-01", end: "2026-11-30" });
    expect(resolveRange(parseAnalyticsFilters({ range: "month", month: "2028-02" }), today)).toMatchObject({ start: "2028-02-01", end: "2028-02-29", months: ["2028-02"] });
    expect(resolveRange(parseAnalyticsFilters({ range: "year", year: "2025" }), today).months).toHaveLength(12);
  });
  it("orders custom dates and falls back when incomplete", () => {
    const r = resolveRange(parseAnalyticsFilters({ range: "custom", from: "2026-03-15", to: "2026-01-10" }), today);
    expect(r).toMatchObject({ start: "2026-01-10", end: "2026-03-15", months: ["2026-01", "2026-02", "2026-03"] });
    expect(resolveRange(parseAnalyticsFilters({ range: "custom", from: "2026-03-15" }), today).label).toBe("Last 6 months");
  });
  it("ignores invalid parameters", () => {
    const f = parseAnalyticsFilters({ range: "bogus", type: "x", category: "nope", month: "2026-13" });
    expect(f).toEqual({ range: "6m", type: "all" });
  });
});
