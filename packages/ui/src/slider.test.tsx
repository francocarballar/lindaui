import { render, screen } from "@testing-library/react";
import { Slider } from "./slider";
import { describe, test, expect } from "vitest";

describe("Slider", () => {
  test("renders a slider thumb", () => {
    render(<Slider aria-label="Volumen" defaultValue={30} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });
});
