"use client";
import type { ReactNode } from "react";
import { AlertCircle, FileText, RotateCcw } from "lucide-react";
import { Button } from "@lindaui/ui/button";
import { SearchField } from "@lindaui/ui/search-field";
import { Skeleton } from "@lindaui/ui/skeleton";
import { Table, type TableColumnDef } from "@lindaui/ui/table";

export interface TablePaneFilter {
  key: string;
  label: string;
  count?: number;
}

/**
 * Tabular sibling of `list-pane`: the same controlled chrome (filter tabs +
 * search + loading/error/empty states) wrapped around `@lindaui/ui/table`,
 * plus a `toolbarExtra` slot and an optional footer. Zero data-fetching — the
 * app passes already-filtered `rows` (each cell is a `ReactNode`, so domain
 * chips/avatars live in the consumer) and owns all state.
 */
export interface TablePaneProps {
  // Table data (delegated to @lindaui/ui/table).
  columns: TableColumnDef[];
  rows: Record<string, ReactNode>[];
  ariaLabel?: string;

  // Filter tabs (same model as list-pane).
  filters?: TablePaneFilter[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;

  // Search.
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;

  // Extra toolbar controls to the right of the search (e.g. a <Select>).
  toolbarExtra?: ReactNode;

  // States.
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  errorTitle?: string;
  retryLabel?: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyIcon?: ReactNode;

  // Footer: `footer` is an escape hatch that wins over the `footerCount` helper.
  footer?: ReactNode;
  footerCount?: { shown: number; total: number; label?: string };
}

export function TablePane({
  columns,
  rows,
  ariaLabel = "Tabla",
  filters,
  activeFilter,
  onFilterChange,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar",
  searchLabel = "Buscar",
  toolbarExtra,
  loading = false,
  error = null,
  onRetry,
  errorTitle = "No se pudo cargar",
  retryLabel = "Reintentar",
  isEmpty,
  emptyTitle = "Sin resultados",
  emptyDescription,
  emptyIcon,
  footer,
  footerCount,
}: TablePaneProps) {
  const showEmpty =
    !loading && !error && (isEmpty !== undefined ? isEmpty : rows.length === 0);
  const showFooter =
    !loading && !error && (footer != null || footerCount != null);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2 overflow-x-auto border-b border-border p-3">
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

      {(onSearchChange || toolbarExtra) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          {onSearchChange && (
            <div className="min-w-[240px] flex-1">
              <SearchField
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                aria-label={searchLabel}
              />
            </div>
          )}
          {toolbarExtra}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-x-auto">
        {loading && (
          <div role="status" aria-label="Cargando" className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="m-3 rounded-xl border border-destructive/35 bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-destructive" />
            <p className="mt-2 text-sm font-semibold">{errorTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            {onRetry && (
              <Button
                variant="secondary"
                size="sm"
                onPress={onRetry}
                className="mt-3"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {retryLabel}
              </Button>
            )}
          </div>
        )}

        {showEmpty && (
          <div className="py-16 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-secondary">
              {emptyIcon ?? (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <p className="mt-3 text-sm font-semibold">{emptyTitle}</p>
            {emptyDescription && (
              <div className="mt-1 text-xs text-muted-foreground">
                {emptyDescription}
              </div>
            )}
          </div>
        )}

        {!loading && !error && !showEmpty && (
          <Table aria-label={ariaLabel} columns={columns} rows={rows} />
        )}
      </div>

      {showFooter &&
        (footer ?? (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <span>
              {footerCount!.label ?? "Mostrando"}{" "}
              <span className="font-medium text-foreground">
                {footerCount!.shown}
              </span>{" "}
              de{" "}
              <span className="font-medium text-foreground">
                {footerCount!.total}
              </span>
            </span>
          </div>
        ))}
    </div>
  );
}
