import { describe, test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrevious } from "./use-previous";

describe("usePrevious", () => {
  test("returns undefined on the first render", () => {
    const { result } = renderHook(() => usePrevious("a"));
    expect(result.current).toBeUndefined();
  });

  test("returns the prior value after subsequent renders", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    rerender({ value: "c" });
    expect(result.current).toBe("b");
  });
});
