import { render, screen } from "@testing-library/react";
import { EntityHealthCard } from "./entity-health-card";
import { describe, test, expect } from "vitest";

describe("EntityHealthCard", () => {
  test("renders title and each item", () => {
    render(
      <EntityHealthCard
        title="Salud de sucursales"
        items={[
          { id: "1", label: "Sucursal Centro", value: "98%", status: "success" },
          { id: "2", label: "Sucursal Norte", value: "62%", status: "warning" },
        ]}
      />,
    );
    expect(screen.getByText("Salud de sucursales")).toBeInTheDocument();
    expect(screen.getByText("Sucursal Centro")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByText("success")).toBeInTheDocument();
    expect(screen.getByText("warning")).toBeInTheDocument();
  });

  test("renders the empty label when there are no items", () => {
    render(<EntityHealthCard title="Salud" items={[]} />);
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });
});
