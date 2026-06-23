import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertDialog } from "./alert-dialog";
import { describe, test, expect, vi } from "vitest";

describe("AlertDialog", () => {
  test("renders title + description when open", () => {
    render(
      <AlertDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        title="¿Eliminar?"
        description="Esta acción no se puede deshacer."
      />,
    );
    expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();
    expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
  });

  test("calls onConfirm on confirm button click", async () => {
    const onConfirm = vi.fn();
    render(
      <AlertDialog
        open
        onClose={() => {}}
        onConfirm={onConfirm}
        title="¿Eliminar?"
        description="No se puede deshacer."
        confirmLabel="Sí, eliminar"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  test("calls onClose on cancel button click", async () => {
    const onClose = vi.fn();
    render(
      <AlertDialog
        open
        onClose={onClose}
        onConfirm={() => {}}
        title="¿Eliminar?"
        description="No se puede deshacer."
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
