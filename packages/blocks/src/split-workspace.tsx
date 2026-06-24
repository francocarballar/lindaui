"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia
    ) {
      return window.matchMedia("(min-width: 768px)").matches;
    }
    return true; // default to desktop when unavailable (jsdom)
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

export interface SplitWorkspaceProps {
  media: ReactNode;
  panel: ReactNode;
  overlay?: ReactNode;
  back?: ReactNode;
}

export function SplitWorkspace({
  media,
  panel,
  overlay,
  back,
}: SplitWorkspaceProps) {
  const isDesktop = useIsDesktop();

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      {isDesktop ? (
        /* Desktop: two-column grid */
        <div className="grid grid-cols-2 h-full">
          <div
            className="relative border-r overflow-hidden"
            style={{ borderColor: "var(--viewer-border)" }}
          >
            {media}
          </div>
          <div className="flex flex-col bg-background h-full min-h-0 overflow-hidden px-0 sm:px-0">
            {panel}
          </div>
        </div>
      ) : (
        /* Mobile: media top, panel stacked below */
        <div className="flex flex-col h-full">
          <div className="relative min-h-[40%] flex-1 min-h-0 overflow-hidden">{media}</div>
          <div className="rounded-t-2xl bg-background shadow-lg overflow-y-auto max-h-[65%] sm:max-h-[60%]">
            {panel}
          </div>
        </div>
      )}

      {/* back slot — absolute top-left */}
      {back && (
        <div className="absolute left-3.5 top-3 z-40">{back}</div>
      )}

      {/* overlay */}
      {overlay && (
        <div className="absolute inset-0 z-[60]">{overlay}</div>
      )}
    </div>
  );
}
