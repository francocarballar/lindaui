import { render, screen } from "@testing-library/react";
import { describe, test, expect, beforeAll, vi } from "vitest";
import { Bar, BarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
  ChartStyle,
} from "./chart";

// Measure LindaUI content independently from Recharts' layout observer.
vi.mock("recharts", async (importOriginal) => ({
  ...await importOriginal<typeof import("recharts")>(),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// recharts ResponsiveContainer usa ResizeObserver (ausente en jsdom).
beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe("chart primitive", () => {
  test("rejects content outside its provider", () => {
    expect(() => render(<ChartTooltipContent active payload={[{ value: 1 }]} />)).toThrow("useChart debe usarse dentro");
  });

  test("omits CSS when no series defines a color", () => {
    const { container } = render(<ChartStyle id="empty" config={{ value: { label: "Value" } }} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("inactive and empty tooltip and legend render no content", () => {
    const { container } = render(<ChartContainer id="empty" config={{}}><>
      <ChartTooltipContent />
      <ChartTooltipContent active />
      <ChartTooltipContent active payload={[]} />
      <ChartLegendContent />
      <ChartLegendContent payload={[]} />
    </></ChartContainer>);
    expect(container.textContent).toBe("");
  });

  test("tooltip resolves labels, values and series colors", () => {
    const { container } = render(<ChartContainer config={{ sales: { label: "Sales", color: "red" }, month: { label: "January" } }}>
      <ChartTooltipContent active labelKey="month" payload={[{ dataKey: "sales", name: "Revenue", value: 12, color: "blue" }]} />
    </ChartContainer>);
    expect(screen.getByText("January")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(container.querySelector("span.size-2\\.5")).toHaveStyle({ background: "blue" });
  });

  test("tooltip supports fallback names, hidden labels and indicators", () => {
    const { rerender, container } = render(<ChartContainer config={{}}>
      <ChartTooltipContent active labelKey="unknown" indicator="line" payload={[{ name: "Fallback", value: 2 }, { value: 3 }, { dataKey: 7, value: 4 }]} />
    </ChartContainer>);
    expect(screen.getByText("unknown")).toBeInTheDocument();
    expect(screen.getByText("Fallback")).toBeInTheDocument();
    expect(screen.getByText("value")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(container.querySelector("span.w-1")).toBeInTheDocument();
    rerender(<ChartContainer config={{ named: { label: "Named series" } }}>
      <ChartTooltipContent active nameKey="named" label="Hidden label" hideLabel hideIndicator payload={[{ name: "Other", value: 5 }]} />
    </ChartContainer>);
    expect(screen.queryByText("Hidden label")).toBeNull();
    expect(screen.getByText("Named series")).toBeInTheDocument();
    expect(container.querySelector("span.shrink-0")).toBeNull();
    rerender(<ChartContainer config={{}}><ChartTooltipContent active label="Visible label" payload={[{ value: 6 }]} /></ChartContainer>);
    expect(screen.getByText("Visible label")).toBeInTheDocument();
    rerender(<ChartContainer config={{}}><ChartTooltipContent active payload={[{ value: 6 }]} /></ChartContainer>);
    expect(screen.queryByText("Visible label")).toBeNull();
  });

  test("legend resolves configured and fallback labels and colors", () => {
    const { rerender, container } = render(<ChartContainer config={{ sales: { label: "Sales" } }}>
      <ChartLegendContent payload={[{ dataKey: "sales", color: "red" }, { value: "Unknown" }, {}, { dataKey: 7 }]} />
    </ChartContainer>);
    for (const label of ["Sales", "Unknown", "value", "7"]) expect(screen.getByText(label)).toBeInTheDocument();
    expect(container.querySelector("span")).toHaveStyle({ background: "red" });
    rerender(<ChartContainer config={{ alias: { label: "Alias" } }}><ChartLegendContent nameKey="alias" payload={[{ value: "Ignored" }]} /></ChartContainer>);
    expect(screen.getByText("Alias")).toBeInTheDocument();
  });
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
