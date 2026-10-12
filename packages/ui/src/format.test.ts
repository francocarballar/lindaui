import { describe, test, expect } from "vitest";
import { formatCurrency, formatDate, formatPhone } from "./format";

describe("formatCurrency", () => {
  test("formats with the default USD/es locale", () => {
    expect(formatCurrency(1234.5)).toContain("1234,5".slice(0, 4));
  });

  test("respects a custom currency and locale", () => {
    const result = formatCurrency(99, { currency: "ARS", locale: "es-AR" });
    expect(result).toContain("99");
  });
});

describe("formatDate", () => {
  test("accepts timestamps and date strings", () => {
    const date = new Date(2026, 6, 8);
    expect(formatDate(date.getTime())).toBe("08/07/2026");
    expect(formatDate("2026-07-08T00:00:00")).toBe("08/07/2026");
  });
  test("formats with the default DD/MM/AAAA shape", () => {
    expect(formatDate(new Date("2026-07-08T00:00:00"))).toBe("08/07/2026");
  });

  test("accepts custom Intl options", () => {
    const result = formatDate(new Date("2026-07-08T00:00:00"), { month: "long" }, "en-US");
    expect(result.toLowerCase()).toContain("july");
  });
});

describe("formatPhone", () => {
  test.each([
    ["1", "1"], ["12", "12"], ["123", "123"],
    ["1234", "123 4"], ["123456", "123 456"],
    [" +12 (345) 678-9 ", "+123 456 789"],
  ])("formats phone %s as %s", (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });
  test("groups digits in chunks of 3", () => {
    expect(formatPhone("1234567")).toBe("123 456 7");
  });

  test("preserves a leading plus sign", () => {
    expect(formatPhone("+549111234567")).toBe("+549 111 234 567");
  });

  test("returns the trimmed input unchanged when there are no digits", () => {
    expect(formatPhone("  n/a  ")).toBe("n/a");
  });
});
