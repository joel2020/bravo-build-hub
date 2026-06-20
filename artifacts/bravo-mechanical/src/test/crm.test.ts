import { describe, it, expect } from "vitest";
import {
  asCurrency,
  asDate,
  asDateTime,
  isSameDay,
  LEAD_STATUS_LABELS,
  JOB_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  STATUS_BADGE_CLASS,
} from "@/lib/crm";

describe("asCurrency", () => {
  it("formats whole-dollar USD with no decimals", () => {
    expect(asCurrency(1500)).toBe("$1,500");
    expect(asCurrency(0)).toBe("$0");
  });

  it("treats null/undefined as $0 instead of NaN", () => {
    expect(asCurrency(null)).toBe("$0");
    expect(asCurrency(undefined)).toBe("$0");
  });

  it("rounds fractional values", () => {
    expect(asCurrency(1499.6)).toBe("$1,500");
  });
});

describe("asDate / asDateTime", () => {
  it("renders an em dash for empty values", () => {
    expect(asDate(null)).toBe("—");
    expect(asDate(undefined)).toBe("—");
    expect(asDateTime(null)).toBe("—");
  });

  it("renders a non-empty string for a valid ISO date", () => {
    expect(asDate("2026-01-15T00:00:00.000Z")).not.toBe("—");
    expect(asDate("2026-01-15T00:00:00.000Z").length).toBeGreaterThan(0);
  });
});

describe("isSameDay", () => {
  it("is true for two times on the same calendar day", () => {
    expect(isSameDay(new Date("2026-06-20T01:00:00"), new Date("2026-06-20T23:00:00"))).toBe(true);
  });

  it("is false across a day boundary", () => {
    expect(isSameDay(new Date("2026-06-20T23:59:00"), new Date("2026-06-21T00:01:00"))).toBe(false);
  });
});

describe("status label maps", () => {
  it("covers every lead pipeline stage", () => {
    expect(Object.keys(LEAD_STATUS_LABELS)).toEqual(
      expect.arrayContaining(["new", "contacted", "qualified", "quoted", "won", "lost"]),
    );
  });

  it("covers every job and invoice status", () => {
    expect(JOB_STATUS_LABELS.in_progress).toBe("In Progress");
    expect(INVOICE_STATUS_LABELS.overdue).toBe("Overdue");
  });

  it("has a badge class for every lead, job, and invoice status key", () => {
    const allStatusKeys = [
      ...Object.keys(LEAD_STATUS_LABELS),
      ...Object.keys(JOB_STATUS_LABELS),
      ...Object.keys(INVOICE_STATUS_LABELS),
    ];
    for (const key of allStatusKeys) {
      expect(STATUS_BADGE_CLASS[key], `missing badge class for "${key}"`).toBeDefined();
    }
  });
});
