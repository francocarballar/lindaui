import { render } from "@testing-library/react";
import { LineChart } from "./line-chart";
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
  { day: "Mon", visitors: 120, bounces: 40 },
  { day: "Tue", visitors: 200, bounces: 60 },
  { day: "Wed", visitors: 180, bounces: 55 },
];

const config: ChartConfig = {
  visitors: { label: "Visitors", color: "hsl(220 70% 50%)" },
  bounces: { label: "Bounces", color: "hsl(340 70% 50%)" },
};

describe("LineChart", () => {
  test("export is defined", () => {
    expect(LineChart).toBeDefined();
  });

  test("renders data-chart container without throwing", () => {
    const { container } = render(
      <LineChart
        data={sampleData}
        config={config}
        categoryKey="day"
        series={["visitors"]}
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders multiple series with legend", () => {
    const { container } = render(
      <LineChart
        data={sampleData}
        config={config}
        categoryKey="day"
        series={["visitors", "bounces"]}
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });

  test("renders dots variant without throwing", () => {
    const { container } = render(
      <LineChart
        data={sampleData}
        config={config}
        categoryKey="day"
        series={["visitors"]}
        variant="dots"
      />
    );
    expect(container.querySelector("[data-chart]")).not.toBeNull();
  });
});
