import { render, screen } from "@testing-library/react";
import { ComboBox } from "./combobox";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const items = [{ value: "x", label: "Opción X" }];

describe("ComboBox", () => {
  test("selects an option and reports its value", async () => {
    const onChange = vi.fn();
    render(<ComboBox label="Buscar" items={items} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(await screen.findByRole("option", { name: "Opción X" }));
    expect(onChange).toHaveBeenCalledWith("x");
    expect(screen.getByRole("combobox", { name: "Buscar" })).toHaveValue("Opción X");
  });
  test("supports controlled selection without a callback", async () => {
    render(<ComboBox label="Buscar" items={items} value="x" />);
    expect(screen.getByRole("combobox", { name: "Buscar" })).toHaveValue("Opción X");
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(await screen.findByRole("option", { name: "Opción X" }));
    expect(screen.getByRole("combobox", { name: "Buscar" })).toHaveValue("Opción X");
  });
  test("renders label", () => {
    render(<ComboBox label="Buscar" items={items} />);
    expect(screen.getByText("Buscar")).toBeInTheDocument();
  });

  test("aria-label names the combobox without a visible label", () => {
    render(<ComboBox aria-label="Modalidad" items={items} />);
    expect(
      screen.getByRole("combobox", { name: /Modalidad/ })
    ).toBeInTheDocument();
  });
});
