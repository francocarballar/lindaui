import { render } from "@testing-library/react";
import { CheckboxGroup } from "./checkbox-group";
import { describe, test, expect } from "vitest";

describe("CheckboxGroup", () => {
  test("renders DOM", () => {
    const { container } = render(<CheckboxGroup aria-label="opciones" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
