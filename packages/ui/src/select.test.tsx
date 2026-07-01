import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./select";
import { describe, test, expect, vi } from "vitest";

const items = [
  { value: "a", label: "Opción A" },
  { value: "b", label: "Opción B" },
];

describe("Select", () => {
  test("renders label", () => {
    render(<Select label="Tipo" items={items} />);
    expect(screen.getByText("Tipo")).toBeInTheDocument();
  });

  test("calls onChange with selected value", async () => {
    const fn = vi.fn();
    render(<Select label="Tipo" items={items} onChange={fn} />);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(await screen.findByRole("option", { name: "Opción A" }));
    expect(fn).toHaveBeenCalledWith("a");
  });

  test("isDisabled disables the trigger", () => {
    render(<Select label="Tipo" items={items} isDisabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("aria-label names the trigger without a visible label", () => {
    render(<Select aria-label="Modalidad" items={items} />);
    // Without a visible label the control now carries an accessible name
    // (react-aria folds the aria-label into the trigger's name).
    expect(
      screen.getByRole("button", { name: /Modalidad/ })
    ).toBeInTheDocument();
  });
});
