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
  test("formats with the default DD/MM/AAAA shape", () => {
    expect(formatDate(new Date("2026-07-08T00:00:00"))).toBe("08/07/2026");
  });

  test("accepts custom Intl options", () => {
    const result = formatDate(new Date("2026-07-08T00:00:00"), { month: "long" }, "en-US");
    expect(result.toLowerCase()).toContain("july");
  });
});

describe("formatPhone", () => {
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
