import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";
import { describe, test, expect, vi } from "vitest";

describe("Checkbox", () => {
  test("renders label", () => {
    render(<Checkbox>Acepto términos</Checkbox>);
    expect(screen.getByRole("checkbox", { name: "Acepto términos" })).toBeInTheDocument();
  });

  test("calls onChange on click", async () => {
    const fn = vi.fn();
    render(<Checkbox onChange={fn}>Acepto</Checkbox>);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(fn).toHaveBeenCalledWith(true);
  });
});
