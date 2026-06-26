import { render } from "@testing-library/react";
import { SwitchGroup } from "./switch-group";
import { describe, test, expect } from "vitest";

describe("SwitchGroup", () => {
  test("renders DOM", () => {
    const { container } = render(<SwitchGroup aria-label="ajustes" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
