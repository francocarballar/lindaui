import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "./menu";
import { describe, test, expect, vi } from "vitest";

describe("Menu", () => {
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
