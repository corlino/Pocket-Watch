import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn with Pocket Watch theme", () => {
  it("keeps colour classes alongside custom font sizes", () => {
    expect(cn("text-expense", "text-body")).toBe("text-expense text-body");
    expect(cn("text-fg-inverse", "text-caption")).toBe("text-fg-inverse text-caption");
  });
  it("still resolves real conflicts", () => {
    expect(cn("text-body", "text-caption")).toBe("text-caption");
    expect(cn("text-fg", "text-expense")).toBe("text-expense");
    expect(cn("shadow-card", "shadow-float")).toBe("shadow-float");
  });
});
