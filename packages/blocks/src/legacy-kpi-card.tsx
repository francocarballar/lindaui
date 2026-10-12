"use client";

import { Card, Skeleton } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import type { LucideIcon } from "lucide-react";

export type KPICardColor = "default" | "success" | "primary" | "warning";
export interface KPICardProps {
  color?: KPICardColor;
  icon: LucideIcon;
  isLoading?: boolean;
  title: string;
  trend?: { value: number; isPositive: boolean };
  value: string | number;
}
const COLOR_CONFIG: Record<KPICardColor, { icon: string; value: string }> = {
  default: { icon: "bg-surface-secondary text-muted", value: "text-foreground" },
  primary: { icon: "bg-accent/10 text-accent", value: "text-accent" },
  success: { icon: "bg-success/10 text-success", value: "text-success" },
  warning: { icon: "bg-warning/10 text-warning", value: "text-warning" },
};
/** Exact legacy KPI anatomy; StatCard and its featured variant remain unchanged. */
export function KPICard({ title, value, icon: Icon, trend, color = "default", isLoading = false }: KPICardProps) {
  const colorConfig = COLOR_CONFIG[color];
  if (isLoading) return <Card className="border-none bg-surface"><Card.Content className="p-4">
    <div className="flex items-start justify-between"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-4 w-16 rounded" /></div>
    <Skeleton className="mt-4 h-8 w-24 rounded" /><Skeleton className="mt-2 h-4 w-20 rounded" />
  </Card.Content></Card>;
  return <Card className="border-none bg-surface transition-colors hover:bg-surface-secondary"><Card.Content className="p-4">
    <div className="flex items-start justify-between">
      <div className={cn("rounded-xl p-2.5", colorConfig.icon)}><Icon size={20} /></div>
      {!!trend && <span className={cn("rounded-full px-2 py-1 font-medium text-xs", trend.isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
        {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
      </span>}
    </div>
    <div className="mt-4"><p className={cn("font-bold text-2xl", colorConfig.value)}>{value}</p><p className="mt-1 text-muted text-sm">{title}</p></div>
  </Card.Content></Card>;
}
