import { render, screen } from "@testing-library/react";
import { Alert } from "./alert";
import { describe, test, expect } from "vitest";

describe("Alert", () => {
  test("renders title and description", () => {
    render(<Alert title="Error crítico" description="Algo salió mal." />);
    expect(screen.getByText("Error crítico")).toBeInTheDocument();
    expect(screen.getByText("Algo salió mal.")).toBeInTheDocument();
  });
});
