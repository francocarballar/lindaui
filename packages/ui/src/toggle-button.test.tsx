import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButton } from "./toggle-button";
import { describe, test, expect } from "vitest";

describe("ToggleButton", () => {
  test("renders and toggles aria-pressed", async () => {
    render(<ToggleButton>Negrita</ToggleButton>);
    const btn = screen.getByRole("button", { name: "Negrita" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });
});
