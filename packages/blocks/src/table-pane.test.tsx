import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { TablePane } from "./table-pane";

const columns = [
  { key: "name", label: "Nombre" },
  { key: "role", label: "Rol" },
];
const rows = [
  { name: "Ada", role: "Dev" },
  { name: "Linus", role: "Ops" },
];

describe("TablePane", () => {
  test("renders columns and rows", () => {
    render(<TablePane ariaLabel="Personas" columns={columns} rows={rows} />);
    expect(
      screen.getByRole("columnheader", { name: "Nombre" })
    ).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Ops")).toBeInTheDocument();
  });

  test("filter buttons fire onFilterChange", async () => {
    const onFilterChange = vi.fn();
    render(
      <TablePane
        columns={columns}
        rows={rows}
        filters={[
          { key: "all", label: "Todos", count: 2 },
          { key: "dev", label: "Devs", count: 1 },
        ]}
        activeFilter="all"
        onFilterChange={onFilterChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /Devs/ }));
    expect(onFilterChange).toHaveBeenCalledWith("dev");
  });

  test("search fires onSearchChange", async () => {
    const onSearchChange = vi.fn();
    render(
      <TablePane
        columns={columns}
        rows={rows}
        searchValue=""
        onSearchChange={onSearchChange}
        searchLabel="Buscar persona"
      />
    );
    await userEvent.type(
      screen.getByRole("searchbox", { name: "Buscar persona" }),
      "a"
    );
    expect(onSearchChange).toHaveBeenCalled();
  });

  test("renders toolbarExtra", () => {
    render(
      <TablePane
        columns={columns}
        rows={rows}
        onSearchChange={() => {}}
        toolbarExtra={<button type="button">Modalidad</button>}
      />
    );
    expect(
      screen.getByRole("button", { name: "Modalidad" })
    ).toBeInTheDocument();
  });

  test("loading shows a status region and hides the table", () => {
    render(<TablePane columns={columns} rows={rows} loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Ada")).toBeNull();
  });

  test("error shows the message and retry fires onRetry", async () => {
    const onRetry = vi.fn();
    render(
      <TablePane
        columns={columns}
        rows={rows}
        error="boom"
        onRetry={onRetry}
        errorTitle="Falló"
        retryLabel="Reintentar"
      />
    );
    expect(screen.getByText("Falló")).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Reintentar/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("empty shows the empty state instead of the table", () => {
    render(
      <TablePane columns={columns} rows={[]} isEmpty emptyTitle="Nada acá" />
    );
    expect(screen.getByText("Nada acá")).toBeInTheDocument();
    expect(screen.queryByRole("grid")).toBeNull();
  });

  test("footerCount renders the shown/total counts", () => {
    render(
      <TablePane
        columns={columns}
        rows={rows}
        footerCount={{ shown: 2, total: 5, label: "Mostrando" }}
      />
    );
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("footer escape hatch wins over footerCount", () => {
    render(
      <TablePane
        columns={columns}
        rows={rows}
        footer={<div>custom footer</div>}
        footerCount={{ shown: 2, total: 5 }}
      />
    );
    expect(screen.getByText("custom footer")).toBeInTheDocument();
  });
});

test("empty tables accept a custom icon and footer counts have a useful default label", () => {
  render(<TablePane columns={columns} rows={[]} emptyIcon={<span>Custom empty icon</span>} footerCount={{ shown: 0, total: 10 }} />);
  expect(screen.getByText("Custom empty icon")).toBeInTheDocument();
  expect(screen.getByText(/Mostrando/)).toHaveTextContent("Mostrando 0 de 10");
});

test("an explicitly null empty icon uses the document fallback", () => {
  const { container } = render(<TablePane columns={columns} rows={[]} emptyIcon={null} />);
  expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  expect(container.querySelector('svg.lucide-file-text')).toBeInTheDocument();
});

test("false explicitly suppresses the empty icon without suppressing its message", () => {
  const { container } = render(<TablePane columns={columns} rows={[]} emptyIcon={false} />);
  expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  expect(container.querySelector('svg.lucide-file-text')).toBeNull();
});

test("empty-state descriptions give the user a recovery instruction", () => {
  render(<TablePane columns={columns} rows={[]} emptyDescription={<p>Change the search filters</p>} />);
  expect(screen.getByText("Change the search filters")).toBeInTheDocument();
});
