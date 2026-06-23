import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";
import { describe, test, expect, vi } from "vitest";

describe("Button", () => {
  test("renders children", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  test("calls onPress", async () => {
    const fn = vi.fn();
    render(<Button onPress={fn}>Ok</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledOnce();
  });

  test("disabled blocks press", async () => {
    const fn = vi.fn();
    render(
      <Button isDisabled onPress={fn}>
        Ok
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(fn).not.toHaveBeenCalled();
  });

  test("variant=danger renders", () => {
    render(<Button variant="danger">Eliminar</Button>);
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeInTheDocument();
  });
});
