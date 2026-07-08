"use client";
import type { ReactNode } from "react";
import { SearchField } from "@lindaui/ui/search-field";
import { ScrollShadow } from "@lindaui/ui/scroll-shadow";
import { Spinner } from "@lindaui/ui/spinner";
import { ConversationListItem } from "./conversation-list-item";
import type { ConversationSummary } from "./chat-types.js";

export interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyContent?: ReactNode;
  filters?: ReactNode;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchValue,
  onSearchChange,
  searchLabel = "Buscar",
  searchPlaceholder = "Buscar conversación…",
  loading = false,
  emptyContent,
  filters,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <SearchField
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>
      {filters != null && <div className="border-b border-border px-3 py-2">{filters}</div>}
      <ScrollShadow className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Spinner aria-label="Cargando" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {emptyContent ?? "Sin conversaciones"}
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              selected={c.id === selectedId}
              onSelect={() => onSelect?.(c.id)}
            />
          ))
        )}
      </ScrollShadow>
    </div>
  );
}
