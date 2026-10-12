"use client";

import { memo, type ReactNode } from "react";
import { cn, formatRelativeTime } from "@lindaui/ui/compat";
import type { ConversationSummary } from "./types";

export interface ConversationListItemProps { avatar?: ReactNode; emptyPreview?: string; item: ConversationSummary; onClick: () => void; }
export const ConversationListItem = memo(({ item, onClick, avatar, emptyPreview }: ConversationListItemProps) => (
  <button className={cn("w-full cursor-pointer px-4 py-3 transition-colors", "md:hover:bg-surface-secondary", item.isSelected && "bg-blue-50 dark:bg-blue-950/20")} onClick={onClick} type="button">
    <div className="flex items-start gap-3">
      {avatar}
      <div className="min-w-0 flex-1 text-left">
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <h4 className="truncate font-semibold text-foreground">{item.title}</h4>
          {item.timestamp && <span className="flex-shrink-0 text-muted text-xs">{formatRelativeTime(item.timestamp)}</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-muted text-sm">{item.preview ?? emptyPreview}</p>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {item.badge}
            {item.unreadCount ? <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-semibold text-accent-foreground text-xs">{item.unreadCount}</span> : null}
          </div>
        </div>
      </div>
    </div>
  </button>
));
