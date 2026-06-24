import type { ReactNode } from "react";
// @ts/ui primitives
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Divider } from "@ts/ui/divider";
import { Skeleton } from "@ts/ui/skeleton";

export interface DocumentPanelProps {
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  statusBadge?: ReactNode;
  state: "empty" | "loading" | "ready";
  emptyContent?: ReactNode;
  loadingLabel?: string;
  notices?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export function DocumentPanel({
  title,
  subtitle,
  meta,
  statusBadge,
  state,
  emptyContent,
  loadingLabel = "Cargando…",
  notices,
  children,
  footer,
}: DocumentPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-3 pt-4 flex-none sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold leading-tight tracking-tight sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {meta && (
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {meta}
            </p>
          )}
        </div>
        {statusBadge && <div className="flex-none">{statusBadge}</div>}
      </div>

      <Divider />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {state === "empty" && emptyContent}

        {state === "loading" && (
          <div role="status" className="flex flex-col gap-3">
            <span className="text-sm text-muted-foreground">{loadingLabel}</span>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        )}

        {state === "ready" && (
          <>
            {notices}
            {children}
          </>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <>
          <Divider />
          <div className="flex-none flex flex-wrap gap-2 p-4">{footer}</div>
        </>
      )}
    </div>
  );
}
