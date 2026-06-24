import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { ChartCard } from "./chart-card";

describe("ChartCard", () => {
  test("renders title as heading", () => {
    render(<ChartCard title="Sales Overview"><div>chart</div></ChartCard>);
    expect(screen.getByRole("heading", { name: "Sales Overview" })).toBeInTheDocument();
  });

  test("renders description when provided", () => {
    render(
      <ChartCard title="Visits" description="Monthly breakdown">
        <div>chart</div>
      </ChartCard>,
    );
    expect(screen.getByText("Monthly breakdown")).toBeInTheDocument();
  });

  test("renders children (chart slot)", () => {
    render(
      <ChartCard title="Revenue">
        <div>my chart content</div>
      </ChartCard>,
    );
    expect(screen.getByText("my chart content")).toBeInTheDocument();
  });

  test("renders footer when passed", () => {
    render(
      <ChartCard title="KPIs" footer={<span>+12% vs last month</span>}>
        <div>chart</div>
      </ChartCard>,
    );
    expect(screen.getByText("+12% vs last month")).toBeInTheDocument();
  });

  test("renders action slot when passed", () => {
    render(
      <ChartCard title="Orders" action={<button>Export</button>}>
        <div>chart</div>
      </ChartCard>,
    );
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });
});
