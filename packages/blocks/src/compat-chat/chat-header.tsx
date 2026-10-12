import type { ReactNode } from "react";

export interface ChatHeaderProps { actions?: ReactNode; avatar?: ReactNode; subtitle?: ReactNode; title: ReactNode; }
export function ChatHeader({ title, subtitle, avatar, actions }: ChatHeaderProps) {
  return <div className="flex items-center justify-between gap-3 border-border border-b px-4 py-3">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {avatar}
      <div className="min-w-0 flex-1"><h3 className="truncate font-medium text-foreground text-sm">{title}</h3>{subtitle && <p className="truncate text-muted text-xs">{subtitle}</p>}</div>
    </div>
    {actions}
  </div>;
}
