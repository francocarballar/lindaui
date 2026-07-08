import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMediaQuery, useIsDesktop, useIsMobile, useIsTablet } from "./use-media-query";

type Listener = (e: { matches: boolean }) => void;

function installMatchMedia(matchingQueries: Set<string>) {
  const listeners = new Map<string, Set<Listener>>();
  const mm = vi.fn((query: string) => {
    const mql = {
      matches: matchingQueries.has(query),
      media: query,
      addEventListener: (_: string, cb: Listener) => {
        if (!listeners.has(query)) listeners.set(query, new Set());
        listeners.get(query)!.add(cb);
      },
      removeEventListener: (_: string, cb: Listener) => {
        listeners.get(query)?.delete(cb);
      },
    };
    return mql;
  });
  // expose a way to flip a query and notify
  (mm as unknown as { flip: (q: string, on: boolean) => void }).flip = (q, on) => {
    if (on) matchingQueries.add(q);
    else matchingQueries.delete(q);
    listeners.get(q)?.forEach((cb) => cb({ matches: on }));
  };
  window.matchMedia = mm as unknown as typeof window.matchMedia;
  return mm as unknown as ReturnType<typeof vi.fn> & {
    flip: (q: string, on: boolean) => void;
  };
}

describe("useMediaQuery", () => {
  afterEach(() => {
    // @ts-expect-error reset between tests
    delete window.matchMedia;
    vi.restoreAllMocks();
  });

  test("devuelve true cuando la query matchea al montar", () => {
    installMatchMedia(new Set(["(min-width: 768px)"]));
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  test("devuelve false cuando la query no matchea", () => {
    installMatchMedia(new Set());
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  test("reacciona a cambios del media query", () => {
    const mm = installMatchMedia(new Set());
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
    act(() => mm.flip("(min-width: 768px)", true));
    expect(result.current).toBe(true);
  });

  test("SSR-safe: sin matchMedia devuelve false sin tirar", () => {
    // no matchMedia instalado
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });
});

describe("useIsDesktop / useIsMobile", () => {
  beforeEach(() => {
    installMatchMedia(new Set(["(min-width: 768px)"]));
  });
  afterEach(() => {
    // @ts-expect-error reset
    delete window.matchMedia;
  });

  test("useIsDesktop usa el breakpoint md (768px)", () => {
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });

  test("useIsMobile es el complemento de desktop", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});

describe("useIsTablet", () => {
  afterEach(() => {
    // @ts-expect-error reset
    delete window.matchMedia;
  });

  test("true dentro del rango tablet [768px, 1024px)", () => {
    installMatchMedia(new Set(["(min-width: 768px) and (max-width: 1023px)"]));
    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(true);
  });

  test("false fuera del rango tablet", () => {
    installMatchMedia(new Set());
    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(false);
  });
});
