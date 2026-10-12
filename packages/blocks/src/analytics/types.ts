import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Presentation-only analytics types. Domain mapping stays in the consumer. */
export interface StatusDatum { color: string; count: number; key: string; label: string; }
export interface StatusDistributionChartProps { data: StatusDatum[]; emptyLabel: string; height?: number; valueLabel: string; }
export interface EntityCell {
  align?: "left" | "right";
  badge?: { color: "default" | "primary" | "secondary" | "success" | "warning" | "danger"; label: string };
  value: string;
}
export interface TopEntityRow { cells: EntityCell[]; id: string; name: string; }
export interface TopEntitiesColumn { align?: "left" | "right"; key: string; label: string; }
export interface TopEntitiesTableProps { columns: TopEntitiesColumn[]; emptyLabel: string; rows: TopEntityRow[]; showRank?: boolean; }
export type HealthStatus = "at_risk" | "critical" | "healthy";
export interface HealthEntity { id: string; name: string; score: number; status: HealthStatus; }
export interface HealthCardLabels {
  allHealthy: string;
  atRisk: string;
  critical: string;
  criticalBadge: (count: number) => string;
  healthy: string;
  idleNote: string;
  scoreLabel: (score: number) => string;
  statusLabel: (status: HealthStatus) => string;
  title: string;
}
export interface EntityHealthCardProps { entities: HealthEntity[]; labels: HealthCardLabels; renderEntityLink?: (entity: HealthEntity, children: ReactNode) => ReactNode; }
export interface AiVsHumanData { aiConverted: number; aiLeads: number; aiRate: number; humanConverted: number; humanLeads: number; humanRate: number; }
export interface AiPerformanceCardProps { aiVsHuman: AiVsHumanData; avgResponseTimeMinutes: number; containmentRate: number; t: (key: string, opts?: Record<string, unknown>) => string; }
export interface AiCostData { available: boolean; conversionsCount: number; costPerConversion: number; totalCostUsd: number; }
export interface AiCostCardProps { aiCost: AiCostData | undefined; isLoading: boolean; t: (key: string, opts?: Record<string, unknown>) => string; }
export type Preset = "24h" | "7d" | "30d" | "custom";
export interface TimeRangePickerProps {
  customRange: RangeValue<DateValue> | null;
  onCustomRangeChange: (v: RangeValue<DateValue> | null) => void;
  onPresetChange: (p: Preset) => void;
  preset: Preset;
  t: (key: string) => string;
}
export interface AnalyticsCardProps { action?: ReactNode; children: ReactNode; icon: LucideIcon; title: string; }
