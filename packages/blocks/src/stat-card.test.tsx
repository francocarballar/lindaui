import { render, screen } from "@testing-library/react";
import { describe, test, expect, beforeAll } from "vitest";
import { StatCard } from "./stat-card";

beforeAll(() => {
  globalThis.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe("StatCard", () => {
  test("renders label and value", () => {
    render(<StatCard label="Revenue" value="$12,345" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$12,345")).toBeInTheDocument();
  });

  test("renders delta when provided", () => {
    render(
      <StatCard
        label="Users"
        value="1,000"
        delta={{ value: "+5%", trend: "up" }}
      />,
    );
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });

  test("works without delta or sparkline", () => {
    render(<StatCard label="Sessions" value="500" />);
    expect(screen.getByText("Sessions")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  test("renders description when provided", () => {
    render(
      <StatCard label="Orders" value="99" description="Last 30 days" />,
    );
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  test("renders sparkline without crashing", () => {
    const data = [{ v: 1 }, { v: 2 }, { v: 3 }];
    render(
      <StatCard
        label="Trend"
        value="42"
        sparkline={{ data, dataKey: "v" }}
      />,
    );
    expect(screen.getByText("Trend")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  test("loading hides value/delta/description behind skeletons", () => {
    render(
      <StatCard
        label="Revenue"
        value="$12,345"
        delta={{ value: "+5%", trend: "up" }}
        description="Last 30 days"
        loading
      />,
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.queryByText("$12,345")).not.toBeInTheDocument();
    expect(screen.queryByText("+5%")).not.toBeInTheDocument();
    expect(screen.queryByText("Last 30 days")).not.toBeInTheDocument();
  });

  test("loading also applies to the featured variant", () => {
    render(<StatCard variant="featured" label="Seekers activos" value="5" loading />);
    expect(screen.getByText("Seekers activos")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });

  test("featured variant renders icon, value, label and delta", () => {
    render(
      <StatCard
        variant="featured"
        tone="primary"
        icon={<svg aria-label="ico" />}
        label="Seekers activos"
        value="5"
        delta={{ value: "+71%", trend: "up" }}
      />,
    );
    expect(screen.getByText("Seekers activos")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("+71%")).toBeInTheDocument();
  });
});
