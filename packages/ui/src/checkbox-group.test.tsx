import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckboxGroup } from "./checkbox-group";
import { Checkbox } from "./checkbox";
import { describe, test, expect, vi } from "vitest";

describe("CheckboxGroup", () => {
  test("renders child checkboxes under a group label", () => {
    render(
      <CheckboxGroup aria-label="frutas">
        <Checkbox value="a">Manzana</Checkbox>
        <Checkbox value="b">Banana</Checkbox>
      </CheckboxGroup>,
    );
    expect(screen.getByRole("checkbox", { name: "Manzana" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Banana" })).toBeInTheDocument();
  });

  test("onChange reports the selected values", async () => {
    const fn = vi.fn();
    render(
      <CheckboxGroup aria-label="frutas" onChange={fn}>
        <Checkbox value="a">Manzana</Checkbox>
        <Checkbox value="b">Banana</Checkbox>
      </CheckboxGroup>,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Manzana" }));
    expect(fn).toHaveBeenCalledWith(["a"]);
  });

  test("controlled value renders the checked state", () => {
    render(
      <CheckboxGroup aria-label="frutas" value={["b"]}>
        <Checkbox value="a">Manzana</Checkbox>
        <Checkbox value="b">Banana</Checkbox>
      </CheckboxGroup>,
    );
    expect(screen.getByRole("checkbox", { name: "Banana" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Manzana" })).not.toBeChecked();
  });
});
