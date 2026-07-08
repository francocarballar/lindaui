import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageComposer } from "./message-composer";
import { describe, test, expect, vi } from "vitest";

describe("MessageComposer", () => {
  test("send button is disabled while empty", () => {
    render(<MessageComposer value="" onValueChange={() => {}} onSend={() => {}} />);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
  });

  test("send button enables once there is text and fires onSend", async () => {
    const onSend = vi.fn();
    render(<MessageComposer value="Hola" onValueChange={() => {}} onSend={onSend} />);
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  test("Enter without shift sends, Shift+Enter does not", async () => {
    const onSend = vi.fn();
    render(<MessageComposer value="Hola" onValueChange={() => {}} onSend={onSend} />);
    const field = screen.getByLabelText("Escribí un mensaje…");
    await userEvent.type(field, "{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.type(field, "{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  test("disabled state blocks the send button regardless of value", () => {
    render(
      <MessageComposer value="Hola" onValueChange={() => {}} onSend={() => {}} isDisabled />,
    );
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
  });
});
