import { renderHook } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { useTheme } from "./use-theme";

// Capture scheduling to verify the documented missing-document guard without
// removing jsdom's document while React DOM itself is committing a render.
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useEffect: vi.fn(),
}));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

test("the scheduled theme effect is safe when the document is unavailable", () => {
  renderHook(() => useTheme());
  const [effect] = vi.mocked(useEffect).mock.calls[0];
  vi.stubGlobal("document", undefined);
  expect(effect).not.toThrow();
});
