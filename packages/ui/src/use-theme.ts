"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "lindaui-theme";

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Toggle de tema light/dark: persiste en `localStorage`, arranca desde
 * `prefers-color-scheme` si no hay preferencia guardada, y togglea la clase
 * `.dark` en `<html>` que `theme.css` ya lee (Anti-regresión de tokens: los
 * canónicos redefinidos en `.dark` cambian solos). SSR-safe: sin `window`
 * arranca en "light" sin tirar.
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme() ?? getSystemTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const persist = useCallback((next: Theme) => {
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      persist(next);
    },
    [persist],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      persist(next);
      return next;
    });
  }, [persist]);

  return { theme, setTheme, toggleTheme };
}
