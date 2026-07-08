"use client";

import { useEffect, useState } from "react";

/** Devuelve `value` retrasado `delayMs` — se re-arma el timer en cada cambio. */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
