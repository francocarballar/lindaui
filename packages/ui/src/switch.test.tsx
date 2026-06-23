import { render, screen } from "@testing-library/react";
import { Switch } from "./switch";
import { describe, test, expect } from "vitest";

describe("Switch", () => {
  test("renders", () => {
    render(<Switch>Activar</Switch>);
    expect(screen.getByRole("switch", { name: "Activar" })).toBeInTheDocument();
  });
});
