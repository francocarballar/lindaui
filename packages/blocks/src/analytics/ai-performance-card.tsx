"use client";

import { Bot, Clock, Shield, User } from "lucide-react";
import { memo } from "react";
import { Divider } from "@lindaui/ui/compat";
import { AnalyticsCard } from "./analytics-card";
import type { AiPerformanceCardProps, AiVsHumanData } from "./types";

const DEFAULT_AI_VS_HUMAN: AiVsHumanData = { aiConverted: 0, aiLeads: 0, aiRate: 0, humanConverted: 0, humanLeads: 0, humanRate: 0 };
function rateColorClass(rate: number): string { return rate >= 10 ? "text-success" : rate >= 5 ? "text-warning" : "text-muted"; }
function StatRow({ label, value, valueClass = "text-foreground" }: { label: string; value: string | number; valueClass?: string }) {
  return <div className="flex items-center justify-between"><span className="text-muted text-xs">{label}</span><span className={`font-semibold text-xs tabular-nums ${valueClass}`}>{value}</span></div>;
}
export const AiPerformanceCard = memo(({ containmentRate = 0, aiVsHuman: aiVsHumanProp, avgResponseTimeMinutes = 0, t }: AiPerformanceCardProps) => {
  const aiVsHuman = aiVsHumanProp ?? DEFAULT_AI_VS_HUMAN;
  return <AnalyticsCard icon={Bot} title={t("analytics.aiPerformance.title")}>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-accent/5 px-4 py-3">
        <div className="mb-1.5 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /><p className="text-muted text-xs">{t("analytics.aiPerformance.containment")}</p></div>
        <p className="font-bold text-3xl text-foreground tabular-nums">{containmentRate}<span className="ml-0.5 font-medium text-lg text-muted">%</span></p>
      </div>
      <div className="rounded-xl bg-surface-secondary px-4 py-3">
        <div className="mb-1.5 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted" /><p className="text-muted text-xs">{t("analytics.aiPerformance.responseTime")}</p></div>
        <p className="font-bold text-3xl text-foreground tabular-nums">{avgResponseTimeMinutes}<span className="ml-1 font-normal text-muted text-sm">{t("analytics.aiPerformance.minutes")}</span></p>
      </div>
    </div>
    <Divider className="my-4" />
    <p className="mb-3 font-medium text-muted text-xs uppercase tracking-wider">{t("analytics.aiPerformance.comparison")}</p>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-1.5"><div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/10"><Bot className="h-3 w-3 text-accent" /></div><p className="font-semibold text-foreground text-xs">{t("analytics.aiPerformance.ai")}</p></div>
        <div className="space-y-2">
          <StatRow label={t("analytics.aiPerformance.leads")} value={aiVsHuman.aiLeads.toLocaleString()} />
          <StatRow label={t("analytics.aiPerformance.converted")} value={aiVsHuman.aiConverted.toLocaleString()} />
          <StatRow label={t("analytics.aiPerformance.rate")} value={`${aiVsHuman.aiRate}%`} valueClass={rateColorClass(aiVsHuman.aiRate)} />
        </div>
      </div>
      <div className="space-y-3 border-border border-l pl-4">
        <div className="flex items-center gap-1.5"><div className="flex h-5 w-5 items-center justify-center rounded-md bg-surface-secondary"><User className="h-3 w-3 text-muted" /></div><p className="font-semibold text-foreground text-xs">{t("analytics.aiPerformance.human")}</p></div>
        <div className="space-y-2">
          <StatRow label={t("analytics.aiPerformance.leads")} value={aiVsHuman.humanLeads.toLocaleString()} />
          <StatRow label={t("analytics.aiPerformance.converted")} value={aiVsHuman.humanConverted.toLocaleString()} />
          <StatRow label={t("analytics.aiPerformance.rate")} value={`${aiVsHuman.humanRate}%`} valueClass={rateColorClass(aiVsHuman.humanRate)} />
        </div>
      </div>
    </div>
  </AnalyticsCard>;
});
