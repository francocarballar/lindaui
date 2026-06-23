import { render, screen } from "@testing-library/react";
import { ComboBox } from "./combobox";
import { describe, test, expect } from "vitest";

const items = [{ value: "x", label: "Opción X" }];

describe("ComboBox", () => {
  test("renders label", () => {
    render(<ComboBox label="Buscar" items={items} />);
    expect(screen.getByText("Buscar")).toBeInTheDocument();
  });
});
