import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTheme } from "./use-theme";

function installMatchMedia(prefersDark: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" && prefersDark,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

function installLocalStorage() {
  const store = new Map<string, string>();
  const fakeStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  } as unknown as Storage;
  Object.defineProperty(window, "localStorage", { value: fakeStorage, configurable: true });
  return fakeStorage;
}

describe("useTheme", () => {
  beforeEach(() => {
    installLocalStorage();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    // @ts-expect-error reset between tests
    delete window.matchMedia;
    // @ts-expect-error reset between tests
    delete window.localStorage;
    document.documentElement.classList.remove("dark");
  });

  test("defaults to light without matchMedia or stored preference", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("picks up prefers-color-scheme when nothing is stored", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("a stored preference wins over system preference", () => {
    installMatchMedia(true);
    window.localStorage.setItem("lindaui-theme", "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  test("setTheme updates state, the dark class, and persists", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("dark"));

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("lindaui-theme")).toBe("dark");
  });

  test("toggleTheme flips between light and dark", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
  });
});
