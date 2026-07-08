"use client";

import { useEffect, useRef } from "react";

/** Devuelve el valor de `value` en el render anterior. `undefined` en el primero. */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
