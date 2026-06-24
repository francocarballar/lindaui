"use client";
import * as React from "react";
import {
  RadialBarChart as RRadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@ts/ui/chart";

export interface RadialChartProps {
  data: Array<Record<string, string | number>>;
  config: ChartConfig;
  categoryKey: string;
  series: string[];
  variant?: "default" | "stacked" | "label";
  className?: string;
}

export function RadialChart({
  data,
  config,
  categoryKey,
  series,
  variant = "default",
  className,
}: RadialChartProps) {
  const isStacked = variant === "stacked";
  const showLabel = variant === "label";

  const total = React.useMemo(() => {
    if (!showLabel) return null;
    return data.reduce((acc, row) => {
      series.forEach((key) => {
        const v = row[key];
        if (typeof v === "number") acc += v;
      });
      return acc;
    }, 0);
  }, [data, series, showLabel]);

  return (
    <ChartContainer config={config} className={className}>
      <RRadialBarChart
        data={data}
        innerRadius="30%"
        outerRadius="90%"
        startAngle={90}
        endAngle={-270}
      >
        <PolarGrid gridType="circle" radialLines={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLabel && (
          <PolarRadiusAxis tick={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                const { cx, cy } = viewBox as { cx: number; cy: number };
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={cx}
                      y={cy}
                      className="fill-foreground text-2xl font-bold"
                      style={{ fontSize: 24, fontWeight: 700 }}
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={cx}
                      y={(cy ?? 0) + 20}
                      className="fill-muted-foreground"
                      style={{ fontSize: 12 }}
                    >
                      Total
                    </tspan>
                  </text>
                );
              }}
            />
          </PolarRadiusAxis>
        )}
        {series.map((key) => (
          <RadialBar
            key={key}
            dataKey={key}
            name={key}
            fill={`var(--color-${key})`}
            stackId={isStacked ? "stack" : undefined}
            background={!isStacked}
            cornerRadius={4}
          />
        ))}
      </RRadialBarChart>
    </ChartContainer>
  );
}
