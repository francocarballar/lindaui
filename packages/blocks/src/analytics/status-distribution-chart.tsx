"use client";

import { useCallback } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, type TooltipProps, XAxis, YAxis } from "recharts";
import type { StatusDistributionChartProps } from "./types";

export function StatusDistributionChart({ data, emptyLabel, valueLabel, height = 220 }: StatusDistributionChartProps) {
  const chartData = [...data].sort((a, b) => b.count - a.count);
  const formatTooltip = useCallback<NonNullable<TooltipProps["formatter"]>>((value) => [value, valueLabel], [valueLabel]);
  if (!chartData.length) return <p className="py-8 text-center text-muted text-sm">{emptyLabel}</p>;
  return <ResponsiveContainer height={height} width="100%">
    <BarChart data={chartData} layout="vertical" margin={{ bottom: 0, left: 0, right: 16, top: 0 }}>
      <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
      <XAxis axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} type="number" />
      <YAxis axisLine={false} dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} type="category" width={110} />
      <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} cursor={{ fill: "var(--surface-secondary)" }} formatter={formatTooltip} />
      <Bar dataKey="count" radius={[0, 4, 4, 0]}>{chartData.map((entry) => <Cell fill={entry.color} key={entry.key} />)}</Bar>
    </BarChart>
  </ResponsiveContainer>;
}
