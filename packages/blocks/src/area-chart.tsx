"use client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@ts/ui/chart";
import {
  AreaChart as RAreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export interface AreaChartProps {
  data: Array<Record<string, string | number>>;
  config: ChartConfig;
  categoryKey: string;
  series: string[];
  variant?: "default" | "stacked" | "gradient";
  className?: string;
}

export function AreaChart({
  data,
  config,
  categoryKey,
  series,
  variant = "default",
  className,
}: AreaChartProps) {
  const isStacked = variant === "stacked";
  const isGradient = variant === "gradient";

  return (
    <ChartContainer config={config} className={className}>
      <RAreaChart data={data}>
        {isGradient && (
          <defs>
            {series.map((key) => (
              <linearGradient
                key={key}
                id={`gradient-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={`var(--color-${key})`}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${key})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
        )}
        <CartesianGrid vertical={false} />
        <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((key) => (
          <Area
            key={key}
            dataKey={key}
            fill={
              isGradient ? `url(#gradient-${key})` : `var(--color-${key})`
            }
            stroke={`var(--color-${key})`}
            stackId={isStacked ? "a" : undefined}
          />
        ))}
      </RAreaChart>
    </ChartContainer>
  );
}
