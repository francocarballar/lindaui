"use client";

import { AlertCircle, DollarSign, TrendingUp, Zap } from "lucide-react";
import { memo, type ElementType } from "react";
import { AnalyticsCard } from "./analytics-card";
import type { AiCostCardProps } from "./types";

function formatUsd(value: number): string { return value.toLocaleString("en-US", { currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: 2, style: "currency" }); }
function StatBlock({ icon: Icon, label, value, accent = false }: { icon: ElementType; label: string; value: string; accent?: boolean }) {
  return <div className={`rounded-xl px-4 py-3 ${accent ? "bg-accent/5" : "bg-surface-secondary"}`}>
    <div className="mb-1.5 flex items-center gap-1.5"><Icon className={`h-3.5 w-3.5 ${accent ? "text-accent" : "text-muted"}`} /><p className="text-muted text-xs">{label}</p></div>
    <p className="font-bold text-foreground text-xl tabular-nums">{value}</p>
  </div>;
}
function NotConfigured({ t }: { t: (key: string) => string }) {
  return <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary"><AlertCircle className="h-5 w-5 text-muted" /></div>
    <p className="font-medium text-muted text-sm">{t("analytics.aiCost.notConfigured")}</p>
    <p className="max-w-[220px] text-muted text-xs">{t("analytics.aiCost.notConfiguredHint")}</p>
  </div>;
}
function LoadingState() { return <div className="grid grid-cols-3 gap-3">{["a", "b", "c"].map((k) => <div className="h-[72px] animate-pulse rounded-xl bg-surface-secondary" key={k} />)}</div>; }
export const AiCostCard = memo(({ aiCost, isLoading, t }: AiCostCardProps) => (
  <AnalyticsCard icon={Zap} title={t("analytics.aiCost.title")}>
    {isLoading ? <LoadingState /> : aiCost?.available === true ? <div className="grid grid-cols-3 gap-3">
      <StatBlock accent icon={DollarSign} label={t("analytics.aiCost.totalCost")} value={formatUsd(aiCost.totalCostUsd)} />
      <StatBlock icon={TrendingUp} label={t("analytics.aiCost.costPerConversion")} value={aiCost.conversionsCount > 0 ? formatUsd(aiCost.costPerConversion) : "—"} />
      <StatBlock icon={Zap} label={t("analytics.aiCost.conversions")} value={aiCost.conversionsCount.toLocaleString()} />
    </div> : <NotConfigured t={t} />}
  </AnalyticsCard>
));
