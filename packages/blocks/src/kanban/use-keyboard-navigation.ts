"use client";

import { useEffect, type RefObject } from "react";

/** Preserve horizontal board navigation, without intercepting text editing. */
export function useKeyboardNavigation<T extends HTMLElement>(
  scrollRef: RefObject<T | null>,
  columnWidth = 320,
) {
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          element.scrollBy({ behavior: "smooth", left: -columnWidth });
          break;
        case "ArrowRight":
          event.preventDefault();
          element.scrollBy({ behavior: "smooth", left: columnWidth });
          break;
        case "Home":
          event.preventDefault();
          element.scrollTo({ behavior: "smooth", left: 0 });
          break;
        case "End":
          event.preventDefault();
          element.scrollTo({ behavior: "smooth", left: element.scrollWidth });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollRef, columnWidth]);
}
