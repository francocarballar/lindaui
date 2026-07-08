import { render, screen } from "@testing-library/react";
import { FetchingIndicator } from "./fetching-indicator";
import { describe, test, expect } from "vitest";

describe("FetchingIndicator", () => {
  test("renders the default label", () => {
    render(<FetchingIndicator />);
    expect(screen.getByText("Actualizando…")).toBeInTheDocument();
  });

  test("renders a custom label", () => {
    render(<FetchingIndicator label="Sincronizando…" />);
    expect(screen.getByText("Sincronizando…")).toBeInTheDocument();
  });
});
