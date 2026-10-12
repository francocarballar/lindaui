import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeRangePicker } from "./time-range-picker";
import { describe, test, expect, vi } from "vitest";

describe("TimeRangePicker", () => {
  test("renders all presets and highlights the active one", () => {
    render(<TimeRangePicker activePreset="today" onPresetChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Hoy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Personalizado" })).toBeInTheDocument();
  });

  test("fires onPresetChange with the clicked preset key", async () => {
    const onPresetChange = vi.fn();
    render(<TimeRangePicker activePreset="today" onPresetChange={onPresetChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Últimos 7 días" }));
    expect(onPresetChange).toHaveBeenCalledWith("7d");
  });

  test("hides the custom range inputs unless the custom preset is active", () => {
    render(<TimeRangePicker activePreset="today" onPresetChange={() => {}} />);
    expect(screen.queryByText("Desde")).not.toBeInTheDocument();
  });

  test("shows and drives the custom range inputs when active", async () => {
    const onRangeChange = vi.fn();
    render(
      <TimeRangePicker
        activePreset="custom"
        onPresetChange={() => {}}
        range={{ start: "2026-07-01", end: "" }}
        onRangeChange={onRangeChange}
      />,
    );
    const [startInput, endInput] = screen.getAllByDisplayValue(/2026-07-01|^$/);
    expect(startInput).toHaveValue("2026-07-01");
    await userEvent.type(endInput, "2026-07-08");
    expect(onRangeChange).toHaveBeenCalled();
  });
});


test("custom dates emit a complete range with empty fallbacks and optional callbacks", () => {
  const onRangeChange = vi.fn();
  const props = { activePreset: "custom", onPresetChange: vi.fn() };
  const { rerender } = render(<TimeRangePicker {...props} onRangeChange={onRangeChange} />);
  fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2026-07-02" } });
  expect(onRangeChange).toHaveBeenLastCalledWith({ start: "2026-07-02", end: "" });
  fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2026-07-03" } });
  expect(onRangeChange).toHaveBeenLastCalledWith({ start: "", end: "2026-07-03" });
  rerender(<TimeRangePicker {...props} range={{ start: "2026-07-01", end: "2026-07-10" }} onRangeChange={onRangeChange} />);
  fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2026-07-02" } });
  expect(onRangeChange).toHaveBeenLastCalledWith({ start: "2026-07-02", end: "2026-07-10" });
  rerender(<TimeRangePicker {...props} />);
  fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "2026-07-02" } });
  fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2026-07-03" } });
  expect(onRangeChange).toHaveBeenCalledTimes(3);
});
