import { afterEach, expect, test, vi } from "vitest";
import { isToday, isYesterday, formatRelativeTime } from "./compat-date";

afterEach(() => vi.useRealTimers());

test("calendar predicates distinguish today, yesterday and older dates", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 12, 12));
  expect(isToday(new Date(2026, 9, 12, 1))).toBe(true);
  expect(isToday(new Date(2026, 9, 11, 23))).toBe(false);
  expect(isYesterday(new Date(2026, 9, 11, 1))).toBe(true);
  expect(isYesterday(new Date(2026, 9, 10, 23))).toBe(false);
  expect(formatRelativeTime(new Date(2026, 9, 12, 10), "en")).toBe("2 hours ago");
  expect(formatRelativeTime(new Date(2026, 9, 12, 10))).toBe("hace 2 horas");
});
