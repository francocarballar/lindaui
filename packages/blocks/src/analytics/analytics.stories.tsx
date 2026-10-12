import { useState } from "react";
import { Building2 } from "lucide-react";
import { AiCostCard, AiPerformanceCard, AnalyticsCard, AnalyticsSkeleton, EntityHealthCard, StatusDistributionChart, TimeRangePicker, TopEntitiesTable, type HealthCardLabels, type Preset, type TimeRangePickerProps } from "../analytics";
import { KPICard } from "../legacy-kpi-card";

const meta = { title: "Blocks/Compatibility/Analytics", component: AnalyticsCard, parameters: { layout: "padded" }, tags: ["autodocs"] };
export default meta;

const labels: HealthCardLabels = { title: "Entity health", healthy: "Healthy", atRisk: "At risk", critical: "Critical", allHealthy: "All entities are healthy", criticalBadge: (count) => `${count} critical`, scoreLabel: (score) => `${score}/100`, statusLabel: (status) => ({ healthy: "Healthy", at_risk: "At risk", critical: "Critical" })[status], idleNote: "Idle entities are excluded" };
const translations: Record<string, string> = {
  "analytics.timeRange.24h": "24 hours", "analytics.timeRange.7d": "7 days", "analytics.timeRange.30d": "30 days", "analytics.timeRange.custom": "Custom", "analytics.timeRange.label": "Date range",
  "analytics.aiPerformance.title": "AI performance", "analytics.aiPerformance.containment": "Containment", "analytics.aiPerformance.responseTime": "Response time", "analytics.aiPerformance.minutes": "min", "analytics.aiPerformance.comparison": "AI vs human", "analytics.aiPerformance.ai": "AI", "analytics.aiPerformance.human": "Human", "analytics.aiPerformance.leads": "Conversations", "analytics.aiPerformance.converted": "Conversions", "analytics.aiPerformance.rate": "Conversion rate",
  "analytics.aiCost.title": "AI cost", "analytics.aiCost.totalCost": "Total cost", "analytics.aiCost.costPerConversion": "Cost per conversion", "analytics.aiCost.conversions": "Conversions", "analytics.aiCost.notConfigured": "Not configured", "analytics.aiCost.notConfiguredHint": "Connect your cost provider to see metrics",
};
const t = (key: string) => translations[key] ?? key;

function ControlledDashboard() {
  const [preset, setPreset] = useState<Preset>("7d");
  const [customRange, setCustomRange] = useState<TimeRangePickerProps["customRange"]>(null);
  return <div className="space-y-6">
    <TimeRangePicker preset={preset} customRange={customRange} onPresetChange={setPreset} onCustomRangeChange={setCustomRange} t={t} />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><KPICard icon={Building2} title="Entities" value={24} /><KPICard icon={Building2} title="Active" value={20} color="success" trend={{ value: 12, isPositive: true }} /><KPICard icon={Building2} title="Conversions" value={128} color="primary" /><KPICard icon={Building2} title="At risk" value={3} color="warning" /></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <AnalyticsCard icon={Building2} title="Status distribution"><StatusDistributionChart emptyLabel="No statuses" valueLabel="Conversations" data={[{ key: "active", label: "Active", count: 128, color: "#00a884" }, { key: "pending", label: "Pending", count: 64, color: "#f5a524" }, { key: "closed", label: "Closed", count: 20, color: "#8696a0" }]} /></AnalyticsCard>
      <EntityHealthCard labels={labels} entities={[{ id: "north", name: "North", score: 91, status: "healthy" }, { id: "east", name: "East", score: 48, status: "at_risk" }, { id: "west", name: "West", score: 15, status: "critical" }]} renderEntityLink={(entity, children) => <a href={`#${entity.id}`}>{children}</a>} />
      <AiPerformanceCard containmentRate={87} avgResponseTimeMinutes={2} aiVsHuman={{ aiLeads: 200, aiConverted: 30, aiRate: 15, humanLeads: 40, humanConverted: 3, humanRate: 7.5 }} t={t} />
      <AiCostCard aiCost={{ available: true, conversionsCount: 30, costPerConversion: 0.82, totalCostUsd: 24.6 }} isLoading={false} t={t} />
    </div>
    <AnalyticsCard icon={Building2} title="Top entities"><TopEntitiesTable emptyLabel="No entities" columns={[{ key: "name", label: "Entity" }, { key: "conversions", label: "Conversions", align: "right" }, { key: "status", label: "Status", align: "right" }]} rows={[{ id: "north", name: "North", cells: [{ value: "North" }, { value: "82", align: "right" }, { value: "", align: "right", badge: { color: "success", label: "Healthy" } }] }]} /></AnalyticsCard>
  </div>;
}
export const ControlledOverview = { render: () => <ControlledDashboard /> };
export const Loading = { render: () => <AnalyticsSkeleton /> };
export const AllHealthy = { render: () => <EntityHealthCard labels={labels} entities={[{ id: "one", name: "One", score: 95, status: "healthy" }]} /> };
export const EmptyAndUnavailable = { render: () => <div className="grid gap-6 lg:grid-cols-2"><AnalyticsCard title="Status distribution" icon={Building2}><StatusDistributionChart data={[]} emptyLabel="No statuses in this range" valueLabel="Count" /></AnalyticsCard><AiCostCard aiCost={undefined} isLoading={false} t={t} /></div> };
