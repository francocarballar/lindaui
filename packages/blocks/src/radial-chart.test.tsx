import { describe, test, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { RadialChart } from "./radial-chart";
import type { ChartConfig } from "@ts/ui/chart";

beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

const config: ChartConfig = {
  completed: { label: "Completed", color: "hsl(142 70% 45%)" },
  pending: { label: "Pending", color: "hsl(38 90% 55%)" },
};

const data = [
  { task: "Sprint 1", completed: 75, pending: 25 },
  { task: "Sprint 2", completed: 50, pending: 50 },
];

describe("RadialChart", () => {
  test("export is defined", () => {
    expect(RadialChart).toBeDefined();
  });

  test("renders without throwing (default variant)", () => {
    const { container } = render(
      <RadialChart
        data={data}
        config={config}
        categoryKey="task"
        series={["completed", "pending"]}
        variant="default"
      />,
    );
    expect(container.querySelector("[data-chart]")).toBeTruthy();
  });

  test("renders without throwing (stacked variant)", () => {
    const { container } = render(
      <RadialChart
        data={data}
        config={config}
        categoryKey="task"
        series={["completed", "pending"]}
        variant="stacked"
      />,
    );
    expect(container.querySelector("[data-chart]")).toBeTruthy();
  });

  test("renders without throwing (label variant)", () => {
    const singleData = [{ task: "Overall", completed: 65, pending: 35 }];
    const { container } = render(
      <RadialChart
        data={singleData}
        config={config}
        categoryKey="task"
        series={["completed"]}
        variant="label"
      />,
    );
    expect(container.querySelector("[data-chart]")).toBeTruthy();
  });
});
