"use client";
import * as React from "react";
import {
  PieChart as RPieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@lindaui/ui/chart";

export interface PieChartProps {
  data: Array<Record<string, string | number>>;
  config: ChartConfig;
  categoryKey: string;
  valueKey: string;
  variant?: "pie" | "donut" | "label";
  className?: string;
}

export function PieChart({
  data,
  config,
  categoryKey,
  valueKey,
  variant = "pie",
  className,
}: PieChartProps) {
  const innerRadius = variant === "donut" ? "55%" : variant === "label" ? "45%" : 0;

  return (
    <ChartContainer config={config} className={className}>
      <RPieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={categoryKey}
          innerRadius={innerRadius}
          outerRadius="80%"
          paddingAngle={2}
        >
          {data.map((entry, index) => {
            const key = String(entry[categoryKey]);
            return (
              <Cell
                key={`cell-${index}`}
                fill={`var(--color-${key})`}
              />
            );
          })}
          {variant === "label" && (
            <LabelList
              dataKey={categoryKey}
              position="outside"
              style={{ fontSize: 12, fill: "var(--foreground)" }}
            />
          )}
        </Pie>
      </RPieChart>
    </ChartContainer>
  );
}
