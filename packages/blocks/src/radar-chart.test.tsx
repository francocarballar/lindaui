import { describe, test, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { RadarChart } from "./radar-chart";
import type { ChartConfig } from "@lindaui/ui/chart";

beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

const config: ChartConfig = {
  speed: { label: "Speed", color: "hsl(210 80% 50%)" },
  strength: { label: "Strength", color: "hsl(140 80% 50%)" },
};

const data = [
  { attribute: "Attack", speed: 80, strength: 60 },
  { attribute: "Defense", speed: 50, strength: 90 },
  { attribute: "Agility", speed: 95, strength: 40 },
  { attribute: "Stamina", speed: 70, strength: 75 },
];

describe("RadarChart", () => {
  test("export is defined", () => {
    expect(RadarChart).toBeDefined();
  });

  test("renders without throwing", () => {
    const { container } = render(
      <RadarChart
        data={data}
        config={config}
        categoryKey="attribute"
        series={["speed", "strength"]}
      />,
    );
    expect(container.querySelector("[data-chart]")).toBeTruthy();
  });

  test("renders single series without throwing", () => {
    const singleConfig: ChartConfig = {
      speed: { label: "Speed", color: "hsl(210 80% 50%)" },
    };
    const { container } = render(
      <RadarChart
        data={data}
        config={singleConfig}
        categoryKey="attribute"
        series={["speed"]}
      />,
    );
    expect(container.querySelector("[data-chart]")).toBeTruthy();
  });
});
