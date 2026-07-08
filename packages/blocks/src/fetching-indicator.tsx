"use client";
import { Spinner } from "@lindaui/ui/spinner";

export interface FetchingIndicatorProps {
  label?: string;
}

/** Pill chico de "actualizando" para superponer sobre contenido ya cargado. */
export function FetchingIndicator({ label = "Actualizando…" }: FetchingIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
      <Spinner aria-label={label} className="size-3" />
      <span>{label}</span>
    </div>
  );
}
