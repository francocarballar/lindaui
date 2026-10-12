"use client";

import { Button } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import type { ReactNode } from "react";

export interface SettingsLayoutSection<Id extends string = string> {
  id: Id;
  label: string;
  icon?: ReactNode;
}

export interface SettingsLayoutProps<Id extends string = string> {
  sections: readonly SettingsLayoutSection<Id>[];
  selected: Id;
  onSelect: (id: Id) => void;
  panels: Record<Id, ReactNode>;
  footer?: ReactNode;
  navigationLabel: string;
  title?: ReactNode;
  compact?: boolean;
  idPrefix?: string;
}

/** Responsive section navigation with mounted, hidden panels and a footer slot. */
export function SettingsLayout<Id extends string>({
  sections,
  panels,
  selected,
  onSelect,
  footer,
  navigationLabel,
  title,
  compact = false,
  idPrefix = "settings",
}: SettingsLayoutProps<Id>) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl", compact ? "h-full p-0" : "p-4 pb-28 lg:p-8")}>
      {title ? <h1 className="mb-6 font-semibold text-2xl tracking-tight">{title}</h1> : null}
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-surface lg:grid lg:grid-cols-[220px_minmax(0,1fr)]",
          compact ? "h-full min-h-0 rounded-none border-0" : "lg:min-h-[620px]",
        )}
      >
        <nav
          aria-label={navigationLabel}
          className="min-h-0 min-w-0 overflow-x-auto border-border border-b bg-surface-secondary p-2 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-3"
        >
          <div className="flex w-max gap-1 lg:w-full lg:flex-col">
            {sections.map(({ id, icon, label }) => (
              <Button
                aria-controls={`${idPrefix}-${id}`}
                aria-pressed={selected === id}
                className={`shrink-0 justify-start gap-2 whitespace-nowrap rounded-lg px-3 text-sm lg:w-full ${selected === id ? "bg-default font-semibold text-foreground" : "text-muted"}`}
                key={id}
                onPress={() => onSelect(id)}
                variant="ghost"
              >
                {icon}
                {label}
              </Button>
            ))}
          </div>
        </nav>
        <div className="flex min-h-0 min-w-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-8">
            {sections.map(({ id, label }) => (
              <section aria-label={label} hidden={selected !== id} id={`${idPrefix}-${id}`} key={id}>
                {panels[id]}
              </section>
            ))}
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}
