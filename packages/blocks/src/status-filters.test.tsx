import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusFilters } from "./status-filters";

describe("StatusFilters compatibility", () => {
  it("keeps selection controlled and emits the raw status key", () => {
    const onStatusToggle = vi.fn();
    const props = { availableStatuses: ["chatting", "booked", "unknown"], selectedStatuses: ["booked"], onStatusToggle, labels: { chatting: "Conversando", booked: "Agendados" }, counts: { chatting: 12, booked: 0 }, colors: { chatting: "warning" as const, booked: "success" as const } };
    const { rerender } = render(<StatusFilters {...props} />);
    expect(screen.getByRole("button", { name: "Conversando (12)" })).toHaveAttribute("aria-pressed", "false");
    const booked = screen.getByRole("button", { name: "Agendados" });
    expect(booked).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "unknown" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(booked);
    expect(onStatusToggle).toHaveBeenCalledWith("booked");
    expect(booked).toHaveAttribute("aria-pressed", "true");
    rerender(<StatusFilters {...props} selectedStatuses={[]} />);
    expect(booked).toHaveAttribute("aria-pressed", "false");
  });
});
