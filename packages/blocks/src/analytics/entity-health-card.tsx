"use client";

import { Activity, CheckCircle2 } from "lucide-react";
import { Fragment, memo, useMemo, type ReactNode } from "react";
import { Badge, Divider } from "@lindaui/ui/compat";
import { AnalyticsCard } from "./analytics-card";
import type { EntityHealthCardProps, HealthEntity, HealthStatus } from "./types";

const STATUS_CONFIG: Record<HealthStatus, { badgeColor: "success" | "warning" | "danger"; dotClass: string; bgClass: string; textClass: string; labelClass: string }> = {
  at_risk: { badgeColor: "warning", bgClass: "bg-warning/8", dotClass: "bg-warning", labelClass: "text-warning/80", textClass: "text-warning" },
  critical: { badgeColor: "danger", bgClass: "bg-danger/8", dotClass: "bg-danger", labelClass: "text-danger/80", textClass: "text-danger" },
  healthy: { badgeColor: "success", bgClass: "bg-success/8", dotClass: "bg-success", labelClass: "text-success/80", textClass: "text-success" },
};
function ScoreBar({ count, total, colorClass }: { count: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-secondary"><div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} /></div>;
}
export const EntityHealthCard = memo(({ entities, labels, renderEntityLink }: EntityHealthCardProps) => {
  const total = entities.length;
  const { healthy, atRisk, critical, alertEntities } = useMemo(() => ({
    healthy: entities.filter((e) => e.status === "healthy").length,
    atRisk: entities.filter((e) => e.status === "at_risk").length,
    critical: entities.filter((e) => e.status === "critical").length,
    alertEntities: entities.filter((e) => e.status !== "healthy"),
  }), [entities]);
  const renderLink = renderEntityLink ?? ((_entity: HealthEntity, children: ReactNode) => <div>{children}</div>);
  const action = critical > 0 ? <Badge color="danger" size="sm" variant="flat">{labels.criticalBadge(critical)}</Badge> : undefined;
  return <AnalyticsCard action={action} icon={Activity} title={labels.title}>
    <div className="grid grid-cols-3 gap-3">
      <div className={`rounded-xl p-3 ${STATUS_CONFIG.healthy.bgClass}`}><p className={`font-bold text-2xl tabular-nums ${STATUS_CONFIG.healthy.textClass}`}>{healthy}</p><p className={`mt-0.5 text-xs ${STATUS_CONFIG.healthy.labelClass}`}>{labels.healthy}</p><ScoreBar colorClass="bg-success" count={healthy} total={total} /></div>
      <div className={`rounded-xl p-3 ${STATUS_CONFIG.at_risk.bgClass}`}><p className={`font-bold text-2xl tabular-nums ${STATUS_CONFIG.at_risk.textClass}`}>{atRisk}</p><p className={`mt-0.5 text-xs ${STATUS_CONFIG.at_risk.labelClass}`}>{labels.atRisk}</p><ScoreBar colorClass="bg-warning" count={atRisk} total={total} /></div>
      <div className={`rounded-xl p-3 ${STATUS_CONFIG.critical.bgClass}`}><p className={`font-bold text-2xl tabular-nums ${STATUS_CONFIG.critical.textClass}`}>{critical}</p><p className={`mt-0.5 text-xs ${STATUS_CONFIG.critical.labelClass}`}>{labels.critical}</p><ScoreBar colorClass="bg-danger" count={critical} total={total} /></div>
    </div>
    {alertEntities.length === 0 ? <div className="mt-4 flex flex-col items-center justify-center gap-2 py-5"><CheckCircle2 className="h-8 w-8 text-success/60" /><p className="text-center text-muted text-xs">{labels.allHealthy}</p></div> : <>
      <Divider className="my-4" />
      <div className="max-h-[200px] space-y-0.5 overflow-y-auto">
        {alertEntities.map((entity) => {
          const cfg = STATUS_CONFIG[entity.status];
          return <Fragment key={entity.id}>{renderLink(entity,
            <div className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-100 hover:bg-surface-secondary">
              <div className="flex min-w-0 items-center gap-2.5"><span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dotClass}`} /><span className="truncate font-medium text-foreground text-sm">{entity.name}</span></div>
              <div className="ml-2 flex flex-shrink-0 items-center gap-2"><span className="font-mono text-muted text-xs tabular-nums">{labels.scoreLabel(entity.score)}</span><Badge color={cfg.badgeColor} size="sm" variant="flat">{labels.statusLabel(entity.status)}</Badge></div>
            </div>
          )}</Fragment>;
        })}
      </div>
      <p className="mt-3 text-muted text-xs">{labels.idleNote}</p>
    </>}
  </AnalyticsCard>;
});
