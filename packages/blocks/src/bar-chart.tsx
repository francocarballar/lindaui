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
  BarChart as RBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export interface BarChartProps {
  data: Array<Record<string, string | number>>;
  config: ChartConfig;
  categoryKey: string;
  series: string[];
  variant?: "default" | "stacked" | "grouped" | "horizontal";
  className?: string;
}

export function BarChart({
  data,
  config,
  categoryKey,
  series,
  variant = "default",
  className,
}: BarChartProps) {
  const isHorizontal = variant === "horizontal";
  const isStacked = variant === "stacked";

  return (
    <ChartContainer config={config} className={className}>
      <RBarChart
        data={data}
        layout={isHorizontal ? "vertical" : "horizontal"}
      >
        <CartesianGrid
          vertical={isHorizontal}
          horizontal={!isHorizontal}
        />
        {isHorizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey={categoryKey}
              type="category"
              tickLine={false}
              axisLine={false}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
          </>
        )}
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            stackId={isStacked ? "a" : undefined}
            radius={4}
          />
        ))}
      </RBarChart>
    </ChartContainer>
  );
}
