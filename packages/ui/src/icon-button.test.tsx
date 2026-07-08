import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./icon-button";
import { describe, test, expect, vi } from "vitest";

describe("IconButton", () => {
  test("renders an accessible icon-only button", () => {
    render(<IconButton aria-label="Cerrar">×</IconButton>);
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
  });

  test("fires onPress", async () => {
    const onPress = vi.fn();
    render(
      <IconButton aria-label="Buscar" onPress={onPress}>
        🔍
      </IconButton>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("disabled blocks interaction", async () => {
    const onPress = vi.fn();
    render(
      <IconButton aria-label="Buscar" onPress={onPress} isDisabled>
        🔍
      </IconButton>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
