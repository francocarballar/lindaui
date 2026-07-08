"use client";
import { formatRelativeTime } from "@lindaui/ui/date";

export interface ChatDateDividerProps {
  date: Date | number | string;
}

/** Divider centrado de día ("Hoy"/"Ayer"/fecha corta) para timelines de chat. */
export function ChatDateDivider({ date }: ChatDateDividerProps) {
  const label = formatRelativeTime(date);
  return (
    <div className="my-3 flex items-center justify-center" role="separator" aria-label={label}>
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        {label}
      </span>
    </div>
  );
}
