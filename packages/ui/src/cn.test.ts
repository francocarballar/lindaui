import { describe, test, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  test("junta clases truthy y descarta falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  test("aplica tailwind-merge: la clase en conflicto que gana es la última", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  test("soporta condicionales", () => {
    const active = true;
    expect(cn("base", active && "on", !active && "off")).toBe("base on");
  });
});
