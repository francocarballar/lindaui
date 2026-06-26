import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButtonGroup } from "./toggle-button-group";
import { ToggleButton } from "./toggle-button";
import { describe, test, expect, vi } from "vitest";

describe("ToggleButtonGroup", () => {
  test("renders its toggle buttons", () => {
    render(
      <ToggleButtonGroup aria-label="alineación" selectionMode="single">
        <ToggleButton id="left">Izquierda</ToggleButton>
        <ToggleButton id="right">Derecha</ToggleButton>
      </ToggleButtonGroup>,
    );
    expect(screen.getByRole("radio", { name: "Izquierda" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Derecha" })).toBeInTheDocument();
  });

  test("onSelectionChange reports the clicked key", async () => {
    const fn = vi.fn();
    render(
      <ToggleButtonGroup aria-label="alineación" selectionMode="single" onSelectionChange={fn}>
        <ToggleButton id="left">Izquierda</ToggleButton>
        <ToggleButton id="right">Derecha</ToggleButton>
      </ToggleButtonGroup>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Izquierda" }));
    expect(fn).toHaveBeenCalled();
    const selection = fn.mock.calls[0][0];
    expect([...selection]).toEqual(["left"]);
  });

  test("isDisabled blocks selection", async () => {
    const fn = vi.fn();
    render(
      <ToggleButtonGroup aria-label="alineación" selectionMode="single" isDisabled onSelectionChange={fn}>
        <ToggleButton id="left">Izquierda</ToggleButton>
        <ToggleButton id="right">Derecha</ToggleButton>
      </ToggleButtonGroup>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Izquierda" }));
    expect(fn).not.toHaveBeenCalled();
  });
});
