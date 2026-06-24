import { describe, test, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDisclosure } from "./use-disclosure";

describe("useDisclosure", () => {
  test("arranca cerrado por default", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  test("respeta defaultOpen", () => {
    const { result } = renderHook(() => useDisclosure(true));
    expect(result.current.isOpen).toBe(true);
  });

  test("open() abre, close() cierra", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  test("toggle() alterna", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  test("los callbacks son estables entre renders", () => {
    const { result, rerender } = renderHook(() => useDisclosure());
    const first = result.current;
    rerender();
    expect(result.current.open).toBe(first.open);
    expect(result.current.close).toBe(first.close);
    expect(result.current.toggle).toBe(first.toggle);
  });
});
