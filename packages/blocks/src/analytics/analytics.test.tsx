import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiCostCard, AiPerformanceCard, EntityHealthCard, TimeRangePicker, TopEntitiesTable, type HealthCardLabels, type HealthEntity } from "../analytics";
import { KPICard } from "../legacy-kpi-card";
import { Building2 } from "lucide-react";

const t = (key: string) => key;
const labels: HealthCardLabels = { title: "Entity health", healthy: "Healthy", atRisk: "At risk", critical: "Critical", allHealthy: "All healthy", criticalBadge: (n) => `${n} critical`, scoreLabel: (n) => `Score ${n}`, statusLabel: (status) => status, idleNote: "Idle entities are excluded" };
describe("generic analytics compatibility", () => {
  it("uses the original KPI anatomy, semantic color and signed trend", () => {
    const { container, rerender } = render(<KPICard icon={Building2} title="Entities" value={42} color="success" trend={{ value: -8, isPositive: false }} />);
    expect(screen.getByText("42")).toHaveClass("text-2xl", "text-success");
    expect(screen.getByText("-8%")).toHaveClass("bg-danger/10", "text-danger");
    expect(container.querySelector(".p-4")).toBeInTheDocument();
    rerender(<KPICard icon={Building2} title="Entities" value={42} isLoading />);
    expect(screen.queryByText("Entities")).toBeNull();
    expect(screen.queryByText("42")).toBeNull();
    expect(container.querySelectorAll(".skeleton")).toHaveLength(4);
  });
  it("summarizes all health statuses and delegates navigation only for alerts", () => {
    const entities: HealthEntity[] = [
      { id: "healthy", name: "Stable", score: 90, status: "healthy" },
      { id: "risk", name: "Risk", score: 45, status: "at_risk" },
      { id: "critical", name: "Critical entity", score: 10, status: "critical" },
    ];
    const renderEntityLink = vi.fn((entity, children) => <a href={`/entities/${entity.id}`}>{children}</a>);
    const { container, rerender } = render(<EntityHealthCard entities={entities} labels={labels} renderEntityLink={renderEntityLink} />);
    expect(screen.getByText("1 critical")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Risk/ })).toHaveAttribute("href", "/entities/risk");
    expect(screen.queryByText("Stable")).toBeNull();
    expect(renderEntityLink).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Score 10")).toBeInTheDocument();
    expect(container.querySelector(".bg-success[style]")).toHaveStyle({ width: "33%" });
    rerender(<EntityHealthCard entities={[entities[0]!]} labels={labels} />);
    expect(screen.getByText("All healthy")).toBeInTheDocument();
    expect(screen.queryByText("1 critical")).toBeNull();
  });
  it("renders declarative ranking columns, badges and unranked/empty states", () => {
    const props = { columns: [{ key: "name", label: "Entity" }, { key: "status", label: "Status", align: "right" as const }], rows: [{ id: "one", name: "One", cells: [{ value: "One" }, { value: "ignored", align: "right" as const, badge: { color: "success" as const, label: "Healthy" } }] }], emptyLabel: "No entities" };
    const { rerender } = render(<TopEntitiesTable {...props} />);
    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "#" })).toBeInTheDocument();
    expect(within(table).getByText("01")).toHaveClass("font-mono", "tabular-nums");
    expect(within(table).getByText("Healthy")).toBeInTheDocument();
    expect(screen.queryByText("ignored")).toBeNull();
    rerender(<TopEntitiesTable {...props} showRank={false} />);
    expect(screen.queryByRole("columnheader", { name: "#" })).toBeNull();
    rerender(<TopEntitiesTable {...props} rows={[]} />);
    expect(screen.getByText("No entities")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });
  it("preserves AI cost unavailable/loading/zero-conversion states and performance thresholds", () => {
    const { rerender } = render(<AiCostCard aiCost={undefined} isLoading={false} t={t} />);
    expect(screen.getByText("analytics.aiCost.notConfigured")).toBeInTheDocument();
    rerender(<AiCostCard aiCost={{ available: true, conversionsCount: 0, costPerConversion: 9, totalCostUsd: 12.5 }} isLoading={false} t={t} />);
    expect(screen.getByText("$12.50")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    rerender(<AiCostCard aiCost={undefined} isLoading t={t} />);
    expect(screen.queryByText("analytics.aiCost.notConfigured")).toBeNull();
    rerender(<AiPerformanceCard containmentRate={80} avgResponseTimeMinutes={2} aiVsHuman={{ aiConverted: 20, aiLeads: 100, aiRate: 20, humanConverted: 7, humanLeads: 100, humanRate: 7 }} t={t} />);
    expect(screen.getByText("20%")).toHaveClass("text-success");
    expect(screen.getByText("7%")).toHaveClass("text-warning");
  });
  it("emits controlled time presets without translating them to domain filters", () => {
    const onPresetChange = vi.fn();
    render(<TimeRangePicker preset="7d" customRange={null} onPresetChange={onPresetChange} onCustomRangeChange={vi.fn()} t={t} />);
    const selected = screen.getByRole("button", { name: "analytics.timeRange.7d" });
    expect(selected).toHaveClass("bg-accent", "shadow-sm");
    fireEvent.click(screen.getByRole("button", { name: "analytics.timeRange.30d" }));
    expect(onPresetChange).toHaveBeenCalledWith("30d");
    expect(selected).toHaveClass("bg-accent");
  });
});
