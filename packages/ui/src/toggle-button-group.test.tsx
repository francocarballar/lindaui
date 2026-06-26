import { render } from "@testing-library/react";
import { ToggleButtonGroup } from "./toggle-button-group";
import { describe, test, expect } from "vitest";

describe("ToggleButtonGroup", () => {
  test("renders DOM", () => {
    const { container } = render(<ToggleButtonGroup aria-label="vista" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
