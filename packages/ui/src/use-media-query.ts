"use client";

import { useEffect, useState } from "react";

/** Breakpoint md de la lib (mobile-first): desktop = >= 768px. */
const DESKTOP_QUERY = "(min-width: 768px)";

function getMatch(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(query).matches;
}

/**
 * Suscribe a un media query y devuelve si matchea. SSR-safe: sin `window`/
 * `matchMedia` devuelve `false` sin tirar.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => getMatch(query));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    // sincroniza por si cambió entre el render inicial y el efecto
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** `true` cuando el viewport es desktop (>= 768px). */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}

/** Complemento de {@link useIsDesktop}: `true` en viewports < 768px. */
export function useIsMobile(): boolean {
  return !useMediaQuery(DESKTOP_QUERY);
}
