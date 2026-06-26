import { render } from "@testing-library/react";
import { Spinner } from "./spinner";
import { describe, test, expect } from "vitest";

describe("Spinner", () => {
  test("renders DOM", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
