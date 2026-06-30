import { render } from "@testing-library/react";
import { AreaChart } from "./area-chart";
import { describe, test, expect, beforeAll } from "vitest";
import type { ChartConfig } from "@lindaui/ui/chart";

beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

const sampleData = [
  { month: "Jan", sales: 100, returns: 20 },
  { month: "Feb", sales: 150, returns: 30 },
  { month: "Mar", sales: 120, returns: 25 },
];

const config: ChartConfig = {
  sales: { label: "Sales", color: "hsl(220 70% 50%)" },
  returns: { label: "Returns", color: "hsl(340 70% 50%)" },
};

describe("AreaChart", () => {
  test("export is defined", () => {
    expect(AreaChart).toBeDefined();
  });

  test("renders data-chart container without throwing", () => {
    const { container } = render(
      <AreaChart
        data={sampleData}
        config={config}
        categoryKey="month"
        series={["sales"]}
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders multiple series with legend", () => {
    const { container } = render(
      <AreaChart
        data={sampleData}
        config={config}
        categoryKey="month"
        series={["sales", "returns"]}
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders stacked variant without throwing", () => {
    const { container } = render(
      <AreaChart
        data={sampleData}
        config={config}
        categoryKey="month"
        series={["sales", "returns"]}
        variant="stacked"
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders gradient variant without throwing", () => {
    const { container } = render(
      <AreaChart
        data={sampleData}
        config={config}
        categoryKey="month"
        series={["sales"]}
        variant="gradient"
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });
});
