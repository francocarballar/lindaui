"use client";

import { useEffect, useState, type RefObject } from "react";
import { cn } from "@lindaui/ui/cn";

export interface ScrollIndicatorsProps {
  scrollRef: RefObject<HTMLElement | null>;
}

export function ScrollIndicators({ scrollRef }: ScrollIndicatorsProps) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    };
    checkScroll();
    element.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      element.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [scrollRef]);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
          showLeft ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
          showRight ? "opacity-100" : "opacity-0",
        )}
      />
    </>
  );
}
