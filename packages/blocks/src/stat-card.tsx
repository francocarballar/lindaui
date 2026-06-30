"use client";
import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@lindaui/ui/card";
import { Badge } from "@lindaui/ui/badge";
import { ChartContainer, type ChartConfig } from "@lindaui/ui/chart";
import { LineChart, Line } from "recharts";

export interface StatCardDelta {
  value: string;
  trend: "up" | "down" | "neutral";
}

export interface StatCardSparkline {
  data: Array<Record<string, number>>;
  dataKey: string;
  color?: string;
}

export type StatCardTone = "primary" | "success" | "warning" | "danger" | "neutral";

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  delta?: StatCardDelta;
  description?: ReactNode;
  icon?: ReactNode;
  sparkline?: StatCardSparkline;
  /** "featured" = icono prominente arriba-izquierda + delta arriba-derecha +
   *  valor grande + label abajo (estilo dashboard). Default = icono inline. */
  variant?: "default" | "featured";
  /** Tinte del icon box (y del valor en featured). Solo aplica a featured. */
  tone?: StatCardTone;
  className?: string;
}

const trendIcon = {
  up: <TrendingUp className="h-3 w-3" />,
  down: <TrendingDown className="h-3 w-3" />,
  neutral: <Minus className="h-3 w-3" />,
};

const trendVariant: Record<StatCardDelta["trend"], "success" | "danger" | "default"> = {
  up: "success",
  down: "danger",
  neutral: "default",
};

// Tonos via arbitrary values sobre los tokens canónicos (robustos: no dependen
// de que HeroUI exponga text-success/text-warning como utilities).
const toneStyles: Record<StatCardTone, { box: string; value: string }> = {
  primary: { box: "bg-[var(--primary)]/10 text-[var(--primary)]", value: "text-[var(--primary)]" },
  success: { box: "bg-[var(--success)]/12 text-[var(--success)]", value: "text-[var(--success)]" },
  warning: { box: "bg-[var(--warning)]/12 text-[var(--warning)]", value: "text-[var(--warning)]" },
  danger: { box: "bg-[var(--destructive)]/10 text-[var(--destructive)]", value: "text-[var(--destructive)]" },
  neutral: { box: "bg-secondary text-muted-foreground", value: "text-foreground" },
};

function DeltaBadge({ delta }: { delta: StatCardDelta }) {
  return (
    <Badge variant={trendVariant[delta.trend]}>
      <span className="flex items-center gap-0.5">
        {trendIcon[delta.trend]}
        {delta.value}
      </span>
    </Badge>
  );
}

function Sparkline({ sparkline }: { sparkline: StatCardSparkline }) {
  const config: ChartConfig = {
    [sparkline.dataKey]: { color: sparkline.color ?? "var(--chart-1)" },
  };
  return (
    <ChartContainer config={config} className="mt-3 h-12 w-full">
      <LineChart data={sparkline.data}>
        <Line
          type="monotone"
          dataKey={sparkline.dataKey}
          stroke={sparkline.color ?? "var(--chart-1)"}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function StatCard({
  label,
  value,
  delta,
  description,
  icon,
  sparkline,
  variant = "default",
  tone = "neutral",
  className = "",
}: StatCardProps) {
  if (variant === "featured") {
    const t = toneStyles[tone];
    return (
      <Card className={className}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            {icon && (
              <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${t.box}`}>
                {icon}
              </div>
            )}
            {delta && <DeltaBadge delta={delta} />}
          </div>
          <div className={`mt-4 text-3xl font-semibold tabular-nums ${t.value}`}>{value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{label}</div>
          {description && (
            <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
          )}
          {sparkline && <Sparkline sparkline={sparkline} />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-semibold tabular-nums sm:text-3xl">{value}</div>
        {delta && (
          <div className="mt-1 flex items-center gap-1">
            <DeltaBadge delta={delta} />
          </div>
        )}
        {description && <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>}
        {sparkline && <Sparkline sparkline={sparkline} />}
      </CardContent>
    </Card>
  );
}
