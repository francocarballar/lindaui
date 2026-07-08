import { render, screen } from "@testing-library/react";
import { ChatDateDivider } from "./chat-date-divider";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

describe("ChatDateDivider", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-07-08T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders Hoy for today's date", () => {
    render(<ChatDateDivider date={new Date("2026-07-08T08:00:00")} />);
    expect(screen.getByRole("separator", { name: "Hoy" })).toBeInTheDocument();
  });

  test("renders Ayer for yesterday's date", () => {
    render(<ChatDateDivider date={new Date("2026-07-07T08:00:00")} />);
    expect(screen.getByRole("separator", { name: "Ayer" })).toBeInTheDocument();
  });
});
