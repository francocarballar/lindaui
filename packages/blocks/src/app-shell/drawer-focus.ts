import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";

/** Add keyboard focus management without changing the original drawer DOM or animations. */
export function useDrawerFocus(isOpen: boolean, onClose: () => void) {
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    } else if (wasOpen.current) {
      triggerRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // React portals bubble through their owner: do not dismiss a drawer behind a menu/modal.
    if (!isOpen || !event.currentTarget.contains(event.target as Node)) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]'
    )).filter((element) => !element.closest('[inert], [aria-hidden="true"]')
      && element.getAttribute("aria-disabled") !== "true");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = event.currentTarget.ownerDocument.activeElement;
    if ((event.shiftKey && activeElement === first)
      || (!event.shiftKey && activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  };
  return { drawerRef, triggerRef, onKeyDown };
}
