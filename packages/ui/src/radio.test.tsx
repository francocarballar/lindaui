import { render, screen } from "@testing-library/react";
import { RadioGroup } from "./radio-group";
import { Radio } from "./radio";
import { describe, test, expect } from "vitest";

describe("Radio", () => {
  test("renders within a group", () => {
    render(
      <RadioGroup aria-label="Plan">
        <Radio value="free">Gratis</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Gratis" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Pro" })).toBeInTheDocument();
  });
});
