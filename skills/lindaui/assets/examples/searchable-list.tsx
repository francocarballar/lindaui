"use client";
import { useState } from "react";
import { ListPane } from "@lindaui/blocks/list-pane";
import { matchesSearch } from "@lindaui/ui/search";

export interface SearchableListProps { items: { id: string; label: string }[]; loading?: boolean; error?: string | null; onRetry?: () => void; }
export function SearchableList({ items, loading = false, error = null, onRetry }: SearchableListProps) {
  const [query, setQuery] = useState("");
  const visible = items.filter(item => matchesSearch(item.label, query));
  return <section aria-label="Items" style={{ minHeight: "20rem" }}><ListPane searchValue={query} onSearchChange={setQuery} searchLabel="Search items" loading={loading} error={error} onRetry={onRetry} isEmpty={visible.length === 0}><ul aria-label="Results">{visible.map(item => <li key={item.id}>{item.label}</li>)}</ul></ListPane></section>;
}
