"use client";
import { useState } from "react";
import { TablePane } from "@lindaui/blocks/table-pane";
import { matchesSearch } from "@lindaui/ui/search";

export interface DataTableProps { rows: { id: string; name: string; email: string }[]; loading?: boolean; error?: string | null; onRetry?: () => void; }
export function DataTable({ rows, loading = false, error = null, onRetry }: DataTableProps) {
  const [query, setQuery] = useState("");
  const visible = rows.filter(row => matchesSearch(row.name + " " + row.email, query));
  return <section aria-label="Contacts" style={{ minHeight: "20rem" }}><TablePane columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }]} rows={visible} searchValue={query} onSearchChange={setQuery} searchLabel="Search contacts" loading={loading} error={error} onRetry={onRetry} isEmpty={visible.length === 0} /></section>;
}
