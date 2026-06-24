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
  LineChart as RLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export interface LineChartProps {
  data: Array<Record<string, string | number>>;
  config: ChartConfig;
  categoryKey: string;
  series: string[];
  variant?: "default" | "dots";
  className?: string;
}

export function LineChart({
  data,
  config,
  categoryKey,
  series,
  variant = "default",
  className,
}: LineChartProps) {
  const showDots = variant === "dots";

  return (
    <ChartContainer config={config} className={className}>
      <RLineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((key) => (
          <Line
            key={key}
            dataKey={key}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={showDots}
            type="monotone"
          />
        ))}
      </RLineChart>
    </ChartContainer>
  );
}
