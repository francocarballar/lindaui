"use client";

import { BarChart2 } from "lucide-react";
import { Badge } from "@lindaui/ui/compat";
import type { EntityCell, TopEntitiesTableProps } from "./types";

export function TopEntitiesTable({ columns, rows, emptyLabel, showRank = true }: TopEntitiesTableProps) {
  if (!rows.length) return <div className="flex flex-col items-center justify-center gap-2 py-12"><BarChart2 className="h-8 w-8 text-muted" /><p className="text-muted text-sm">{emptyLabel}</p></div>;
  return <div className="overflow-x-auto"><table className="w-full text-sm">
    <thead><tr className="border-border border-b">
      {showRank ? <th className="pr-3 pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">#</th> : null}
      {columns.map((col) => <th className={`pr-3 pb-3 font-medium text-muted text-xs uppercase tracking-wider ${col.align === "right" ? "text-right" : "text-left"}`} key={col.key}>{col.label}</th>)}
    </tr></thead>
    <tbody className="divide-y divide-border">{rows.map((row, i) => <tr className="group transition-colors duration-100 hover:bg-surface-secondary/60" key={row.id}>
      {showRank ? <td className="py-3 pr-3"><span className="font-mono text-muted text-xs tabular-nums">{String(i + 1).padStart(2, "0")}</span></td> : null}
      {row.cells.map((cell, ci) => <Cell cell={cell} key={columns[ci]?.key ?? String(ci)} />)}
    </tr>)}</tbody>
  </table></div>;
}
function Cell({ cell }: { cell: EntityCell }) {
  const isRight = cell.align === "right";
  if (cell.badge) return <td className={`py-3 ${isRight ? "text-right" : "pr-3"}`}><Badge color={cell.badge.color} size="sm" variant="flat">{cell.badge.label}</Badge></td>;
  return <td className={`py-3 pr-3 text-sm ${isRight ? "text-right text-muted tabular-nums" : "font-medium text-foreground"}`}>{cell.value}</td>;
}
