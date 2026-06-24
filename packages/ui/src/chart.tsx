"use client";
import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";
import { cn } from "./cn";

// Primitivo de charts: réplica del patrón de shadcn (ChartContainer + ChartConfig
// + tooltip/legend), sobre recharts, themable por CSS vars. NO usa Radix. El
// consumidor compone los tipos de recharts (AreaChart/BarChart/...) como children.
// El color de cada serie se inyecta como `--color-<key>` desde el `config`, así
// los hijos recharts usan `var(--color-<key>)` y el dark-mode sale gratis (los
// tokens --chart-* ya cambian en .dark).

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  }
>;

interface ChartContextValue {
  config: ChartConfig;
}
const ChartContext = React.createContext<ChartContextValue | null>(null);

export function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart debe usarse dentro de <ChartContainer>");
  return ctx;
}

let chartIdCounter = 0;

export interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useMemo(() => `chart-${++chartIdCounter}`, []);
  const chartId = `chart-${id ?? uniqueId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          // resets de estilo de recharts para que herede los tokens del DS
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorEntries = Object.entries(config).filter(([, c]) => c.color);
  if (!colorEntries.length) return null;
  const css = `[data-chart=${id}] {\n${colorEntries
    .map(([key, c]) => `  --color-${key}: ${c.color};`)
    .join("\n")}\n}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

// Tooltip/Legend = los de recharts; el contenido custom va en `content`.
export const ChartTooltip = RechartsTooltip;
export const ChartLegend = RechartsLegend;

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: React.ReactNode;
  labelKey?: string;
  nameKey?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line";
  className?: string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelKey,
  nameKey,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  className,
}: ChartTooltipContentProps) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  const resolvedLabel = labelKey
    ? config[labelKey]?.label ?? labelKey
    : label;

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md",
        className,
      )}
    >
      {!hideLabel && resolvedLabel != null && (
        <div className="font-medium">{resolvedLabel}</div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, i) => {
          const key = nameKey ?? item.dataKey?.toString() ?? item.name ?? "value";
          const cfg = config[key];
          const color = item.color ?? `var(--color-${key})`;
          return (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {!hideIndicator && (
                  <span
                    className={cn(
                      "shrink-0 rounded-[2px]",
                      indicator === "dot" ? "size-2.5" : "h-2.5 w-1",
                    )}
                    style={{ background: color }}
                  />
                )}
                <span className="text-muted-foreground">
                  {cfg?.label ?? item.name ?? key}
                </span>
              </div>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LegendPayloadItem {
  value?: string;
  dataKey?: string | number;
  color?: string;
}

export interface ChartLegendContentProps {
  payload?: LegendPayloadItem[];
  nameKey?: string;
  hideIcon?: boolean;
  className?: string;
}

export function ChartLegendContent({
  payload,
  nameKey,
  className,
}: ChartLegendContentProps) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4 pt-3", className)}>
      {payload.map((item, i) => {
        const key = nameKey ?? item.dataKey?.toString() ?? item.value ?? "value";
        const cfg = config[key];
        return (
          <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ background: item.color ?? `var(--color-${key})` }}
            />
            {cfg?.label ?? item.value ?? key}
          </div>
        );
      })}
    </div>
  );
}
