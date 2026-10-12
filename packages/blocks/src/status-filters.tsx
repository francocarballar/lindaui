"use client";

import { Badge, type BadgeColor } from "@lindaui/ui/compat";

export interface StatusFiltersProps {
  availableStatuses: string[];
  colors?: Record<string, BadgeColor>;
  counts?: Record<string, number>;
  labels?: Record<string, string>;
  onStatusToggle: (status: string) => void;
  selectedStatuses: string[];
}

/** Controlled status chips; labels, colors and counts belong to the consumer. */
export function StatusFilters({ availableStatuses, selectedStatuses, onStatusToggle, counts, labels, colors }: StatusFiltersProps) {
  const handleToggle = (status: string) => () => onStatusToggle(status);
  return <div className="flex flex-wrap gap-2">
    {availableStatuses.map((status) => {
      const isSelected = selectedStatuses.includes(status);
      const count = counts?.[status] ?? 0;
      return <button aria-pressed={isSelected} className="cursor-pointer transition-opacity hover:opacity-80" key={status} onClick={handleToggle(status)} type="button">
        <Badge color={colors?.[status] ?? "default"} size="sm" variant={isSelected ? "solid" : "flat"}>
          {labels?.[status] ?? status}{count > 0 ? ` (${count})` : ""}
        </Badge>
      </button>;
    })}
  </div>;
}
