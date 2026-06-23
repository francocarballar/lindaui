import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./dialog";
import { describe, test, expect, vi } from "vitest";

describe("Dialog", () => {
  test("renders title and content when open", () => {
    render(
      <Dialog open onClose={() => {}} title="Confirmar acción">
        Contenido
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirmar acción")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  test("no dialog when open=false", () => {
    render(
      <Dialog open={false} onClose={() => {}}>
        Oculto
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("calls onClose on Escape", async () => {
    const fn = vi.fn();
    render(
      <Dialog open onClose={fn}>
        Body
      </Dialog>,
    );
    await userEvent.keyboard("{Escape}");
    expect(fn).toHaveBeenCalled();
  });
});
