"use client";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@lindaui/ui/badge";

export interface ListItemProps {
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  badge?: { label: string; variant?: "default" | "success" | "warning" | "danger" | "info" };
  selected?: boolean;
  onSelect?: () => void;
  showChevron?: boolean;
}

export function ListItem({
  title,
  subtitle,
  meta,
  leading,
  badge,
  selected = false,
  onSelect,
  showChevron = false,
}: ListItemProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        "flex w-full items-center gap-3 border-b border-border px-3 py-3.5 text-left transition-colors sm:px-4",
        "min-h-[72px] cursor-pointer font-[inherit] text-[inherit] active:bg-accent",
        selected
          ? "bg-primary/5 lg:border-l-2 lg:border-l-primary"
          : "bg-card hover:bg-accent/50",
      ].join(" ")}
    >
      {leading != null && (
        <div className="flex-none">{leading}</div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{title}</div>
        {subtitle != null && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</div>
        )}
        {meta != null && (
          <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">{meta}</div>
        )}
      </div>
      {badge != null && (
        <Badge variant={badge.variant ?? "default"}>{badge.label}</Badge>
      )}
      {showChevron && (
        <ChevronRight
          aria-hidden
          className="-mr-1 size-4 flex-none text-muted-foreground/50 lg:hidden"
        />
      )}
    </button>
  );
}
