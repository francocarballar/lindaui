import { render, screen } from "@testing-library/react";
import { Table } from "./table";
import { describe, test, expect } from "vitest";

const columns = [
  { key: "name", label: "Nombre" },
  { key: "age", label: "Edad" },
];
const rows = [
  { name: "Ana", age: "30" },
  { name: "Luis", age: "25" },
];

describe("Table", () => {
  test("renders column headers", () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByRole("columnheader", { name: "Nombre" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Edad" })).toBeInTheDocument();
  });

  test("renders row data", () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByRole("rowheader", { name: "Ana" })).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { name: "25" })).toBeInTheDocument();
  });

  test("renders empty state when no rows", () => {
    render(<Table columns={columns} rows={[]} emptyContent="Sin resultados" />);
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });
});
