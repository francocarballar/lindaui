import { render, screen } from "@testing-library/react";
import { Chip } from "./chip";
import { describe, test, expect } from "vitest";

describe("Chip", () => {
  test("renders children", () => {
    render(<Chip>Activo</Chip>);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });
});
