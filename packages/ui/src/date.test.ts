import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { isToday, isYesterday, formatShortTime, formatRelativeTime } from "./date";

describe("date", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-07-08T15:30:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("isToday matches the current calendar day", () => {
    expect(isToday(new Date("2026-07-08T02:00:00"))).toBe(true);
    expect(isToday(new Date("2026-07-07T23:59:00"))).toBe(false);
  });

  test("isYesterday matches the previous calendar day", () => {
    expect(isYesterday(new Date("2026-07-07T10:00:00"))).toBe(true);
    expect(isYesterday(new Date("2026-07-08T10:00:00"))).toBe(false);
  });

  test("formatShortTime renders HH:mm", () => {
    const result = formatShortTime(new Date("2026-07-08T09:05:00"), "en-GB");
    expect(result).toMatch(/^09:05/);
  });

  test("formatRelativeTime returns Hoy for today", () => {
    expect(formatRelativeTime(new Date("2026-07-08T08:00:00"))).toBe("Hoy");
  });

  test("formatRelativeTime returns Ayer for yesterday", () => {
    expect(formatRelativeTime(new Date("2026-07-07T08:00:00"))).toBe("Ayer");
  });

  test("formatRelativeTime returns a short date for older days in the same year", () => {
    expect(formatRelativeTime(new Date("2026-01-15T08:00:00"))).toBe("15/01");
  });

  test("formatRelativeTime includes the year for dates in a different year", () => {
    expect(formatRelativeTime(new Date("2025-01-15T08:00:00"))).toBe("15/01/2025");
  });

  test("accepts string and number inputs, not just Date", () => {
    expect(formatRelativeTime("2026-07-08T08:00:00")).toBe("Hoy");
    expect(formatRelativeTime(new Date("2026-07-08T08:00:00").getTime())).toBe("Hoy");
  });
});
