"use client";

import { InputGroup, ScrollShadow, Spinner } from "@lindaui/ui/compound";
import { Search, X } from "lucide-react";
import { type ReactNode, useCallback } from "react";
import { TimeDivider } from "./time-divider";
import { groupByTime, TIME_GROUP_ORDER, type TimeGroup } from "./time-grouping";
import { ConversationListItem } from "./conversation-list-item";
import type { ConversationSummary } from "./types";

export interface ConversationListLabels { emptyPreview?: string; loading: string; periods: Record<TimeGroup, string>; }
export interface ConversationListProps {
  emptyMessage?: ReactNode;
  filters?: ReactNode;
  isLoading?: boolean;
  items: ConversationSummary[];
  labels: ConversationListLabels;
  onItemSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  renderAvatar?: (item: ConversationSummary) => ReactNode;
  searchPlaceholder?: string;
  searchValue: string;
  /** Optional virtualized list. The consumer owns row placement and group headers. */
  renderItems?: (items: ConversationSummary[], renderItem: (item: ConversationSummary) => ReactNode) => ReactNode;
}
export function ConversationList({ items, searchValue, onSearchChange, searchPlaceholder, filters, labels, isLoading = false, emptyMessage, onItemSelect, renderAvatar, renderItems }: ConversationListProps) {
  const grouped = groupByTime(items, (item) => item.timestamp ?? new Date());
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value), [onSearchChange]);
  const handleClearSearch = useCallback(() => onSearchChange(""), [onSearchChange]);
  const handleItemSelect = useCallback((id: string) => () => onItemSelect(id), [onItemSelect]);
  const renderItem = (item: ConversationSummary) => <ConversationListItem avatar={renderAvatar?.(item)} emptyPreview={labels.emptyPreview} item={item} key={item.id} onClick={handleItemSelect(item.id)} />;
  return <div className="flex h-full flex-col bg-background">
    <div className="space-y-3 border-border border-b p-4">
      <InputGroup className="w-full rounded-lg">
        <InputGroup.Prefix><Search className="h-4 w-4 text-muted" /></InputGroup.Prefix>
        <InputGroup.Input className="text-sm" onChange={handleSearchChange} placeholder={searchPlaceholder} value={searchValue} />
        {searchValue && <InputGroup.Suffix><button className="text-muted hover:text-muted" onClick={handleClearSearch} type="button"><X className="h-4 w-4" /></button></InputGroup.Suffix>}
      </InputGroup>
      {filters}
    </div>
    <ScrollShadow className="flex-1 overflow-y-auto">
      {isLoading && <div className="flex items-center justify-center gap-2 py-8"><Spinner size="sm" /><span className="text-muted text-sm">{labels.loading}</span></div>}
      {!isLoading && items.length === 0 && <div className="flex flex-col items-center justify-center px-4 py-12 text-center"><p className="text-muted text-sm">{emptyMessage}</p></div>}
      {!isLoading && items.length > 0 && (renderItems ? renderItems(items, renderItem) : <div>
        {TIME_GROUP_ORDER.map((timeGroup) => grouped[timeGroup].length === 0 ? null : <div key={timeGroup}><TimeDivider label={labels.periods[timeGroup]} />{grouped[timeGroup].map(renderItem)}</div>)}
      </div>)}
    </ScrollShadow>
  </div>;
}
