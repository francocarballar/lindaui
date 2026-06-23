import { render, screen } from "@testing-library/react";
import { CloseButton } from "./close-button";
import { describe, test, expect } from "vitest";

describe("CloseButton", () => {
  test("renders a button", () => {
    render(<CloseButton aria-label="Cerrar" />);
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
  });
});
