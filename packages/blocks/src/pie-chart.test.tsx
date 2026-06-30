import { describe, test, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { PieChart } from "./pie-chart";
import type { ChartConfig } from "@lindaui/ui/chart";

beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

const config: ChartConfig = {
  apples: { label: "Apples", color: "hsl(12 80% 50%)" },
  bananas: { label: "Bananas", color: "hsl(45 80% 50%)" },
  oranges: { label: "Oranges", color: "hsl(200 80% 50%)" },
};

const data = [
  { category: "apples", value: 30 },
  { category: "bananas", value: 50 },
  { category: "oranges", value: 20 },
];

describe("PieChart", () => {
  test("export is defined", () => {
    expect(PieChart).toBeDefined();
  });

  test("renders without throwing (pie variant)", () => {
    const { container } = render(
      <PieChart
        data={data}
        config={config}
        categoryKey="category"
        valueKey="value"
        variant="pie"
      />,
    );
    expect(container.querySelector("[data-chart]")).toBeTruthy();
  });

  test("renders without throwing (donut variant)", () => {
    const { container } = render(
      <PieChart
        data={data}
        config={config}
        categoryKey="category"
        valueKey="value"
        variant="donut"
      />,
    );
    expect(container.querySelector("[data-chart]")).toBeTruthy();
  });

  test("renders without throwing (label variant)", () => {
    const { container } = render(
      <PieChart
        data={data}
        config={config}
        categoryKey="category"
        valueKey="value"
        variant="label"
      />,
    );
    expect(container.querySelector("[data-chart]")).toBeTruthy();
  });
});
