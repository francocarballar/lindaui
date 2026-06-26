import { render } from "@testing-library/react";
import { InputGroup } from "./input-group";
import { describe, test, expect } from "vitest";

describe("InputGroup", () => {
  test("renders DOM", () => {
    const { container } = render(<InputGroup />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
