"use client";
import * as React from "react";
import {
  RadarChart as RRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@ts/ui/chart";

export interface RadarChartProps {
  data: Array<Record<string, string | number>>;
  config: ChartConfig;
  categoryKey: string;
  series: string[];
  className?: string;
}

export function RadarChart({
  data,
  config,
  categoryKey,
  series,
  className,
}: RadarChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RRadarChart data={data}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <PolarGrid />
        <PolarAngleAxis dataKey={categoryKey} />
        <PolarRadiusAxis />
        {series.map((key) => (
          <Radar
            key={key}
            dataKey={key}
            name={key}
            fill={`var(--color-${key})`}
            stroke={`var(--color-${key})`}
            fillOpacity={0.5}
          />
        ))}
      </RRadarChart>
    </ChartContainer>
  );
}
