import { render } from "@testing-library/react";
import { describe, test, expect, beforeAll } from "vitest";
import { Bar, BarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
} from "./chart";

// recharts ResponsiveContainer usa ResizeObserver (ausente en jsdom).
beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe("chart primitive", () => {
  test("exporta el primitivo completo", () => {
    expect(ChartContainer).toBeDefined();
    expect(ChartTooltip).toBeDefined();
    expect(ChartTooltipContent).toBeDefined();
    expect(ChartLegend).toBeDefined();
    expect(ChartLegendContent).toBeDefined();
    expect(useChart).toBeDefined();
  });

  test("inyecta data-chart + --color-<serie> desde el config", () => {
    const { container } = render(
      <ChartContainer config={{ ventas: { label: "Ventas", color: "var(--chart-1)" } }}>
        <BarChart data={[{ mes: "Ene", ventas: 12 }]}>
          <Bar dataKey="ventas" />
        </BarChart>
      </ChartContainer>,
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
    const style = container.querySelector("style");
    expect(style?.textContent).toContain("--color-ventas");
    expect(style?.textContent).toContain("var(--chart-1)");
  });
});
