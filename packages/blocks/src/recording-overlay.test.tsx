import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { RecordingOverlay } from "./recording-overlay";

describe("RecordingOverlay", () => {
  test("renders formatted elapsed time", () => {
    render(
      <RecordingOverlay
        label="Recording"
        elapsed={65}
        onStop={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  test("renders 00:00 when elapsed=0", () => {
    render(
      <RecordingOverlay
        label="Recording"
        elapsed={0}
        onStop={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  test("stop button fires onStop", async () => {
    const onStop = vi.fn();
    render(
      <RecordingOverlay
        label="Recording"
        elapsed={10}
        onStop={onStop}
        onCancel={vi.fn()}
        stopLabel="Detener"
      />
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Detener" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  test("shows error state and back button fires onCancel", async () => {
    const onCancel = vi.fn();
    render(
      <RecordingOverlay
        label="Recording"
        elapsed={0}
        error="Microphone not found"
        onStop={vi.fn()}
        onCancel={onCancel}
        backLabel="Volver"
      />
    );
    expect(screen.getByText("Microphone not found")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Volver" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("variant=inline renders the same content without absolute positioning", () => {
    const { container } = render(
      <RecordingOverlay
        label="Recording"
        elapsed={65}
        onStop={vi.fn()}
        onCancel={vi.fn()}
        stopLabel="Detener"
        variant="inline"
      />
    );
    // content intact
    expect(screen.getByText("01:05")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Detener" })).toBeInTheDocument();
    // inline root drops the overlay's absolute/z positioning
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/absolute/);
    expect(root.className).toMatch(/h-full/);
  });
});
