"use client";
import type { ReactNode } from "react";
import { ChartCard } from "./chart-card";
import { Badge } from "@lindaui/ui/badge";
import { Divider } from "@lindaui/ui/divider";

export type EntityHealthStatus = "default" | "success" | "warning" | "danger" | "info";

export interface EntityHealthItem {
  id: string;
  label: string;
  value: ReactNode;
  status?: EntityHealthStatus;
  statusLabel?: string;
}

export interface EntityHealthCardProps {
  title: ReactNode;
  description?: ReactNode;
  items: EntityHealthItem[];
  emptyLabel?: string;
}

/** Lista de salud de entidades genérica (ex-GymHealthCard, generalizado). */
export function EntityHealthCard({
  title,
  description,
  items,
  emptyLabel = "Sin datos",
}: EntityHealthCardProps) {
  return (
    <ChartCard title={title} description={description}>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item, i) => (
            <div key={item.id}>
              {i > 0 && <Divider />}
              <div className="flex items-center justify-between gap-2 py-2.5">
                <span className="truncate text-sm">{item.label}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">{item.value}</span>
                  {item.status && <Badge variant={item.status}>{item.statusLabel ?? item.status}</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}
