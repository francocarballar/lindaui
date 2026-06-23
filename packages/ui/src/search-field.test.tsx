import { render, screen } from "@testing-library/react";
import { SearchField } from "./search-field";
import { describe, test, expect } from "vitest";

describe("SearchField", () => {
  test("renders with label", () => {
    render(<SearchField label="Buscar" />);
    expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
  });
});
