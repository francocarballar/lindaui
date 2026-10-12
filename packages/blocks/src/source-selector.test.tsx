import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { SourceSelector } from "./source-selector";

const options = [
  { key: "inbound", label: "Inbound", triggerLabel: "IN", icon: <span>i</span>, triggerIcon: <span>in</span> },
  { key: "outbound", label: "Outbound", triggerLabel: "OUT" },
] as const;

describe("SourceSelector", () => {
  test("renders caller labels and emits the stable key without changing controlled selection", async () => {
    const onSourceChange = vi.fn();
    render(<SourceSelector source="inbound" options={options} onSourceChange={onSourceChange} ariaLabel="Choose channel" />);
    const trigger = screen.getByRole("button", { name: /IN/ });
    expect(trigger).toHaveClass("h-6", "min-w-0", "gap-1", "px-2", "text-[10px]");
    expect(screen.getByText("in")).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(await screen.findByRole("menu")).toHaveAttribute("aria-label", "Choose channel");
    expect(screen.getByRole("menuitemradio", { name: /Inbound/ })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Outbound" }));
    expect(onSourceChange).toHaveBeenCalledWith("outbound");
    expect(screen.getByRole("button", { name: /IN/ })).toBeInTheDocument();
  });

  test("shows a spinner instead of the current icon while pending", () => {
    render(<SourceSelector source="inbound" options={options} onSourceChange={vi.fn()} isLoading />);
    expect(screen.queryByText("in")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /IN/ })).toBeInTheDocument();
  });

  test("handles an empty option list with the supplied source label", () => {
    render(<SourceSelector source="unassigned" options={[]} onSourceChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "unassigned" })).toBeInTheDocument();
  });
});
