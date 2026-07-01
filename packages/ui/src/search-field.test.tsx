import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchField } from "./search-field";
import { describe, test, expect } from "vitest";

describe("SearchField", () => {
  test("renders with label", () => {
    render(<SearchField label="Buscar" />);
    expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
  });

  test("exposes a searchbox role", () => {
    render(<SearchField label="Buscar" />);
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toBeInTheDocument();
  });

  test("shows a clear button once there is a value and it clears", async () => {
    render(<SearchField label="Buscar" />);
    const el = screen.getByRole("searchbox", { name: "Buscar" });
    await userEvent.type(el, "maria");
    expect(el).toHaveValue("maria");
    const clear = screen.getByRole("button");
    await userEvent.click(clear);
    expect(el).toHaveValue("");
  });
});
