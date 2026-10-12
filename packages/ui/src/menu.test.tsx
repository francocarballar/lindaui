import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "./menu";
import { describe, test, expect, vi } from "vitest";

describe("Menu", () => {
  test("allows optional actions, rich labels and danger styling", async () => {
    render(<Menu trigger="Acciones" items={[{ key: "other", label: "Otro" }, { key: "delete", label: <span>Eliminar</span>, isDanger: true }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Acciones" }));
    const action = await screen.findByRole("menuitem", { name: "Eliminar" });
    expect(action).toHaveClass("text-danger");
    await userEvent.click(action);
    expect(screen.queryByRole("menu")).toBeNull();
  });
  test("trigger is visible", () => {
    render(
      <Menu items={[{ key: "edit", label: "Editar" }]} trigger="Acciones" />,
    );
    expect(screen.getByRole("button", { name: "Acciones" })).toBeInTheDocument();
  });

  test("calls onAction on item click", async () => {
    const fn = vi.fn();
    render(
      <Menu
        items={[{ key: "go", label: "Ir", onAction: fn }]}
        trigger="Abrir"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Ir" }));
    expect(fn).toHaveBeenCalledOnce();
  });
});
