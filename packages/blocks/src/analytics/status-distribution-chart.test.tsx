import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusDistributionChart } from "./status-distribution-chart";

const chartProps = vi.hoisted(() => ({ chart: {} as Record<string, unknown>, tooltip: {} as Record<string, unknown>, fills: [] as string[] }));
vi.mock("recharts", async () => {
  const { createElement } = await import("react");
  return {
    ResponsiveContainer: ({ children, height }: { children: React.ReactNode; height: number }) => createElement("div", { "data-testid": "chart-container", style: { height } }, children),
    BarChart: ({ children, ...props }: { children: React.ReactNode }) => { chartProps.chart = props; chartProps.fills = []; return createElement("div", {}, children); },
    CartesianGrid: () => null, XAxis: () => null, YAxis: () => null,
    Tooltip: (props: Record<string, unknown>) => { chartProps.tooltip = props; return null; },
    Bar: ({ children }: { children: React.ReactNode }) => createElement("div", {}, children),
    Cell: ({ fill }: { fill: string }) => { chartProps.fills.push(fill); return null; },
  };
});
describe("StatusDistributionChart", () => {
  it("sorts without mutating input and preserves original chart configuration", () => {
    const data = [{ key: "small", label: "Small", count: 2, color: "#aaaaaa" }, { key: "large", label: "Large", count: 9, color: "#00a884" }];
    render(<StatusDistributionChart data={data} emptyLabel="Empty" valueLabel="Conversations" height={260} />);
    expect(data.map((item) => item.key)).toEqual(["small", "large"]);
    expect(chartProps.chart).toMatchObject({ data: [data[1], data[0]], layout: "vertical", margin: { bottom: 0, left: 0, right: 16, top: 0 } });
    expect(chartProps.fills).toEqual(["#00a884", "#aaaaaa"]);
    expect(chartProps.tooltip.contentStyle).toEqual({ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" });
    expect((chartProps.tooltip.formatter as (value: number) => unknown)(9)).toEqual([9, "Conversations"]);
    expect(screen.getByTestId("chart-container")).toHaveStyle({ height: "260px" });
  });
  it("renders the caller's empty label instead of a chart", () => {
    render(<StatusDistributionChart data={[]} emptyLabel="No statuses" valueLabel="Count" />);
    expect(screen.getByText("No statuses")).toHaveClass("py-8", "text-muted");
    expect(screen.queryByTestId("chart-container")).toBeNull();
  });
});
