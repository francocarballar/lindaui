"use client";
import type { ReactNode } from "react";
import { formatRelativeTime } from "@lindaui/ui/date";
import { ChatAvatar } from "./chat-avatar";
import type { ConversationSummary } from "./chat-types.js";

export interface ConversationListItemProps {
  conversation: ConversationSummary;
  selected?: boolean;
  onSelect?: () => void;
  trailing?: ReactNode;
}

export function ConversationListItem({
  conversation,
  selected = false,
  onSelect,
  trailing,
}: ConversationListItemProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left font-[inherit] text-[inherit] transition-colors ${
        selected ? "bg-primary/5" : "bg-card hover:bg-accent/50"
      }`}
    >
      <ChatAvatar name={conversation.title} src={conversation.avatarUrl} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{conversation.title}</span>
          {conversation.lastMessageAt != null && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {conversation.subtitle != null && (
            <span className="truncate text-xs text-muted-foreground">{conversation.subtitle}</span>
          )}
          {!!conversation.unreadCount && (
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
      {trailing}
    </button>
  );
}
