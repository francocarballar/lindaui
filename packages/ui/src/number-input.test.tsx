import { render, screen } from "@testing-library/react";
import { NumberInput } from "./number-input";
import { describe, test, expect } from "vitest";

describe("NumberInput", () => {
  test("renders with label", () => {
    render(<NumberInput label="Cantidad" />);
    expect(screen.getByLabelText("Cantidad")).toBeInTheDocument();
  });
});
