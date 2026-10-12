"use client";

import { Button } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

export interface NavigationButtonsProps {
  scrollRef: RefObject<HTMLElement | null>;
  columnWidth?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export function NavigationButtons({
  scrollRef,
  columnWidth = 320,
  leftLabel = "Scroll left",
  rightLabel = "Scroll right",
}: NavigationButtonsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };
    checkScroll();
    element.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      element.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [scrollRef]);

  const scroll = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({
      behavior: "smooth",
      left: element.scrollLeft + (direction === "left" ? -columnWidth : columnWidth),
    });
  };

  return (
    <>
      <Button
        aria-label={leftLabel}
        className={cn(
          "absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full shadow-xl transition-opacity",
          canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        isIconOnly
        onPress={() => scroll("left")}
        size="md"
        variant="primary"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        aria-label={rightLabel}
        className={cn(
          "absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full shadow-xl transition-opacity",
          canScrollRight ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        isIconOnly
        onPress={() => scroll("right")}
        size="md"
        variant="primary"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </>
  );
}
