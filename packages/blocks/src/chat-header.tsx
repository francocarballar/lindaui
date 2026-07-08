"use client";
import type { ReactNode } from "react";

export interface ChatHeaderProps {
  avatar?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function ChatHeader({ avatar, title, subtitle, actions }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
      {avatar}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{title}</div>
        {subtitle != null && (
          <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {actions != null && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}
