import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { ListPane } from "./list-pane";

describe("ListPane", () => {
  test("renders search input via aria-label", () => {
    render(<ListPane searchLabel="Buscar estudios" />);
    expect(screen.getByLabelText("Buscar estudios")).toBeInTheDocument();
  });

  test("typing in search calls onSearchChange", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<ListPane searchLabel="Buscar" onSearchChange={onSearchChange} searchValue="" />);
    const input = screen.getByLabelText("Buscar");
    await user.type(input, "a");
    expect(onSearchChange).toHaveBeenCalled();
  });

  test("clicking a filter button fires onFilterChange with its key", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <ListPane
        filters={[
          { key: "all", label: "Todos" },
          { key: "pending", label: "Pendientes" },
        ]}
        activeFilter="all"
        onFilterChange={onFilterChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /Pendientes/ }));
    expect(onFilterChange).toHaveBeenCalledWith("pending");
  });

  test("loading state renders role=status", () => {
    render(<ListPane loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Cargando")).toBeInTheDocument();
  });

  test("error state shows error text and retry button", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ListPane error="Error de red" onRetry={onRetry} />);
    expect(screen.getByText("Error de red")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Reintentar/ }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  test("renders children when not loading/error/empty", () => {
    render(
      <ListPane>
        <div>Item 1</div>
        <div>Item 2</div>
      </ListPane>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  test("shows empty state when isEmpty=true", () => {
    render(<ListPane isEmpty emptyTitle="Nada por aquí" />);
    expect(screen.getByText("Nada por aquí")).toBeInTheDocument();
  });
});
