import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { StatsGrid } from "./stats-grid";

describe("StatsGrid", () => {
  test("renders children", () => {
    render(
      <StatsGrid>
        <div>Card A</div>
        <div>Card B</div>
      </StatsGrid>,
    );
    expect(screen.getByText("Card A")).toBeInTheDocument();
    expect(screen.getByText("Card B")).toBeInTheDocument();
  });

  test("renders multiple children in grid", () => {
    render(
      <StatsGrid columns={3}>
        <div>Stat 1</div>
        <div>Stat 2</div>
        <div>Stat 3</div>
      </StatsGrid>,
    );
    expect(screen.getByText("Stat 1")).toBeInTheDocument();
    expect(screen.getByText("Stat 2")).toBeInTheDocument();
    expect(screen.getByText("Stat 3")).toBeInTheDocument();
  });

  test("renders with 2 columns", () => {
    render(
      <StatsGrid columns={2}>
        <div>Alpha</div>
        <div>Beta</div>
      </StatsGrid>,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
});
