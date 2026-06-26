import { render } from "@testing-library/react";
import { Skeleton } from "./skeleton";
import { describe, test, expect } from "vitest";

describe("Skeleton", () => {
  test("renders DOM", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
