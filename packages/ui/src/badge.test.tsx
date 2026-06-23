import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";
import { describe, test, expect } from "vitest";

describe("Badge", () => {
  test("renders children", () => {
    render(<Badge>Firmado</Badge>);
    expect(screen.getByText("Firmado")).toBeInTheDocument();
  });
});
