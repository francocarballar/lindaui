"use client";

import { useCallback, useState } from "react";

export interface UseDisclosureReturn {
  /** Estado actual: abierto/cerrado. */
  isOpen: boolean;
  /** Fuerza abierto. */
  open: () => void;
  /** Fuerza cerrado. */
  close: () => void;
  /** Alterna el estado. */
  toggle: () => void;
}

/**
 * Estado boolean de apertura para overlays controlados (`dialog`, `drawer`,
 * `menu`, `popover`). Pensado para `isOpen={x.isOpen}` + `onOpenChange`.
 * Callbacks estables (no recrean en cada render).
 */
export function useDisclosure(defaultOpen = false): UseDisclosureReturn {
  const [isOpen, setOpen] = useState<boolean>(defaultOpen);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
