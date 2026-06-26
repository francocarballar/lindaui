import { render } from "@testing-library/react";
import { Avatar } from "./avatar";
import { describe, test, expect } from "vitest";

describe("Avatar", () => {
  test("renders DOM", () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
