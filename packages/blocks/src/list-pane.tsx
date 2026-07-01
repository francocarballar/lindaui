"use client";
import React, { type ReactNode } from "react";
import { AlertCircle, FileText, RotateCcw } from "lucide-react";
import { Button } from "@lindaui/ui/button";
import { SearchField } from "@lindaui/ui/search-field";
import { Skeleton } from "@lindaui/ui/skeleton";

export interface ListPaneFilter {
  key: string;
  label: string;
  count?: number;
}

export interface ListPaneProps {
  filters?: ListPaneFilter[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  errorTitle?: string;
  retryLabel?: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyIcon?: ReactNode;
  children?: ReactNode;
}

export function ListPane({
  filters,
  activeFilter,
  onFilterChange,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar",
  searchLabel = "Buscar",
  loading = false,
  error = null,
  onRetry,
  errorTitle = "No se pudieron cargar los datos",
  retryLabel = "Reintentar",
  isEmpty,
  emptyTitle = "Sin resultados",
  emptyDescription,
  emptyIcon,
  children,
}: ListPaneProps) {
  const showEmpty =
    !loading &&
    !error &&
    (isEmpty !== undefined ? isEmpty : React.Children.count(children) === 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Top controls */}
      <div className="flex-none space-y-3 px-3 pb-3 pt-3 sm:px-4">
        {filters && filters.length > 0 && (
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            {filters.map((f) => (
              <Button
                key={f.key}
                variant={activeFilter === f.key ? "primary" : "ghost"}
                onPress={() => onFilterChange?.(f.key)}
                size="sm"
              >
                {f.label}
                {f.count != null && (
                  <span
                    aria-hidden
                    className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted-foreground/15 px-1 text-[11px] font-semibold tabular-nums text-muted-foreground"
                  >
                    {f.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        )}

        <SearchField
          value={searchValue}
          onChange={onSearchChange ?? (() => {})}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
        />
      </div>

      {/* Scroll area */}
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-border">
        {loading && (
          <div role="status" aria-label="Cargando">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border px-3 py-3.5 sm:px-4"
              >
                <Skeleton className="h-[42px] w-[42px] rounded-[11px]" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-2.5 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="m-3 rounded-xl border border-destructive/35 bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-destructive" />
            <p className="mt-2 text-sm font-semibold">{errorTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            {onRetry && (
              <Button variant="secondary" size="sm" onPress={onRetry} className="mt-3">
                <RotateCcw className="h-3.5 w-3.5" />
                {retryLabel}
              </Button>
            )}
          </div>
        )}

        {showEmpty && (
          <div className="py-16 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-secondary">
              {emptyIcon ?? <FileText className="h-5 w-5 text-muted-foreground" />}
            </div>
            <p className="mt-3 text-sm font-semibold">{emptyTitle}</p>
            {emptyDescription && (
              <div className="mt-1 text-xs text-muted-foreground">{emptyDescription}</div>
            )}
          </div>
        )}

        {!loading && !error && !showEmpty && children}
      </div>
    </div>
  );
}
