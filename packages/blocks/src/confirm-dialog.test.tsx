import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  test("renders dialog when open=true", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Confirm action"
        description="Are you sure?"
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("does not render dialog when open=false", () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Confirm action"
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("clicking confirm fires onConfirm", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        title="Confirm action"
        confirmLabel="Confirmar"
      />
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("clicking cancel fires onOpenChange(false)", async () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
        title="Confirm action"
        cancelLabel="Cancelar"
      />
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("renders identity name when provided", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Sign document"
        destructive
        identity={{ name: "Jane Doe" }}
      />
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  test("destructive confirm still fires onConfirm", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        title="Delete item"
        destructive
        confirmLabel="Eliminar"
      />
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
