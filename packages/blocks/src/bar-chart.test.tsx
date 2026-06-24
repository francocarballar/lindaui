import { render } from "@testing-library/react";
import { BarChart } from "./bar-chart";
import { describe, test, expect, beforeAll } from "vitest";
import type { ChartConfig } from "@ts/ui/chart";

beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

const sampleData = [
  { category: "Q1", revenue: 400, costs: 200 },
  { category: "Q2", revenue: 600, costs: 250 },
  { category: "Q3", revenue: 500, costs: 220 },
];

const config: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(220 70% 50%)" },
  costs: { label: "Costs", color: "hsl(340 70% 50%)" },
};

describe("BarChart", () => {
  test("export is defined", () => {
    expect(BarChart).toBeDefined();
  });

  test("renders data-chart container without throwing", () => {
    const { container } = render(
      <BarChart
        data={sampleData}
        config={config}
        categoryKey="category"
        series={["revenue"]}
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders grouped variant (multiple series)", () => {
    const { container } = render(
      <BarChart
        data={sampleData}
        config={config}
        categoryKey="category"
        series={["revenue", "costs"]}
        variant="grouped"
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders stacked variant without throwing", () => {
    const { container } = render(
      <BarChart
        data={sampleData}
        config={config}
        categoryKey="category"
        series={["revenue", "costs"]}
        variant="stacked"
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders horizontal variant without throwing", () => {
    const { container } = render(
      <BarChart
        data={sampleData}
        config={config}
        categoryKey="category"
        series={["revenue"]}
        variant="horizontal"
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });
});
