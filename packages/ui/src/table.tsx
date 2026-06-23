"use client";
import {
  Table as HeroTable,
  TableContent,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import type { ReactNode } from "react";

export interface TableColumnDef {
  key: string;
  label: string;
}

/**
 * Declarative table: `columns[]` + `rows[]`. Composes HeroUI v3's RAC table
 * collection (TableHeader/TableColumn + TableBody/TableRow/TableCell). RAC
 * requires stable row ids and one row-header column, handled internally.
 */
export interface TableProps {
  columns: TableColumnDef[];
  rows: Record<string, ReactNode>[];
  emptyContent?: ReactNode;
  "aria-label"?: string;
}

export function Table({
  columns,
  rows,
  emptyContent = "Sin datos",
  "aria-label": ariaLabel = "Tabla",
}: TableProps) {
  const items = rows.map((row, index) => ({ id: String(index), row }));

  return (
    <HeroTable>
      <TableContent aria-label={ariaLabel}>
        <TableHeader columns={columns}>
          {(col: TableColumnDef) => (
            <TableColumn id={col.key} isRowHeader={col.key === columns[0]?.key}>
              {col.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={items} renderEmptyState={() => emptyContent}>
          {(item) => (
            <TableRow id={item.id}>
              {columns.map((col) => (
                <TableCell key={col.key}>{item.row[col.key]}</TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </TableContent>
    </HeroTable>
  );
}
