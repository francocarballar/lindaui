"use client";

import type { ReactNode } from "react";
import { useIsDesktop } from "@lindaui/ui/use-media-query";
import { WorkspaceBackButton } from "./workspace-back-button";

export interface SplitWorkspaceProps {
  media: ReactNode;
  panel: ReactNode;
  overlay?: ReactNode;
  /**
   * Custom back control (escape hatch). Wins over `backHref`/`backLabel`.
   * Prefer `backHref`/`backLabel` — the default renders a legible pill over
   * any media without the consumer having to guarantee contrast.
   */
  back?: ReactNode;
  backHref?: string;
  backLabel?: ReactNode;
}

export function SplitWorkspace({
  media,
  panel,
  overlay,
  back,
  backHref,
  backLabel = "Volver",
}: SplitWorkspaceProps) {
  const isDesktop = useIsDesktop();
  const backNode =
    back ??
    (backHref != null ? (
      <WorkspaceBackButton href={backHref} label={backLabel} />
    ) : null);

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

      {/* back slot — legibility scrim + safe-area, top-left over the media */}
      {backNode && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 bg-linear-to-b from-black/25 to-transparent p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.875rem,env(safe-area-inset-left))]">
          <div className="pointer-events-auto inline-block">{backNode}</div>
        </div>
      )}

      {/* overlay */}
      {overlay && (
        <div className="absolute inset-0 z-[60]">{overlay}</div>
      )}
    </div>
  );
}
