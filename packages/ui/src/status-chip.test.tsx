import { render, screen } from "@testing-library/react";
import { StatusChip } from "./status-chip";
import { describe, test, expect } from "vitest";

describe("StatusChip", () => {
  test("BORRADOR label", () => {
    render(<StatusChip status="BORRADOR" />);
    expect(screen.getByText("Borrador")).toBeInTheDocument();
  });
  test("CONFIRMADO label", () => {
    render(<StatusChip status="CONFIRMADO" />);
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
  });
  test("FIRMADO label", () => {
    render(<StatusChip status="FIRMADO" />);
    expect(screen.getByText("Firmado")).toBeInTheDocument();
  });
});
