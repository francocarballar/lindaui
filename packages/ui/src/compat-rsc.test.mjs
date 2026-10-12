// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = (name) => readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
const output = (name) => readFileSync(new URL(`../dist/${name}`, import.meta.url), "utf8");
const isClientModule = (code) => /^\s*["']use client["'];/m.test(code);

describe("compatibility barrel server/client boundaries", () => {
  it("keeps pure utility paths outside a blanket client boundary", () => {
    for (const file of ["compat.tsx", "compat-date.ts", "cn.ts"]) {
      expect(isClientModule(source(file)), file).toBe(false);
    }
    expect(source("compat.tsx")).toContain('export { cn } from "./cn"');
    expect(source("compat.tsx")).toContain('export { formatRelativeTime, isToday, isYesterday } from "./compat-date"');
  });

  it("keeps every interactive compatibility leaf independently client-marked", () => {
    for (const file of ["compat-button.tsx", "compat-input.tsx", "compat-display.tsx", "compat-use-debounce.ts", "use-debounce.ts"]) {
      expect(isClientModule(source(file)), file).toBe(true);
    }
  });

  // A clean checkout can run the source guards before building. Once artifacts
  // exist, also catch bundlers hoisting a leaf's directive into the mixed entry.
  it.skipIf(!existsSync(fileURLToPath(new URL("../dist/compat.js", import.meta.url))))("preserves the boundaries in emitted package artifacts", () => {
    expect(isClientModule(output("compat.js"))).toBe(false);
    expect(isClientModule(output("compat-date.js"))).toBe(false);
    for (const file of ["compat-button.js", "compat-input.js", "compat-display.js", "compat-use-debounce.js"]) {
      expect(isClientModule(output(file)), file).toBe(true);
    }
    for (const file of ["compat-button.js", "compat-input.js", "compat-display.js", "compat-use-debounce.js", "compat-date.js"]) {
      expect(output("compat.js"), file).toContain(`'./${file}'`);
    }
    expect(output("compat-date.js")).not.toMatch(/from ["'](?:react|.*compat-(?:button|input|display|use-debounce))["']/);
  });
});
