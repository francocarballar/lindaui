import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";
import { describe, test, expect, vi } from "vitest";

describe("LoginForm", () => {
  test("bare form submits values and loading disables its submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(<LoginForm bare className="embedded-form" onSubmit={onSubmit} />);
    expect(screen.queryByText("Iniciar sesión")).toBeNull();
    await user.type(screen.getByLabelText("Email"), "ada@example.test");
    await user.type(screen.getByLabelText("Contraseña"), "test-password");
    await act(async () => { await user.click(screen.getByRole("button", { name: "Ingresar" })); });
    expect(onSubmit).toHaveBeenCalledWith({ email: "ada@example.test", password: "test-password" });
    rerender(<LoginForm bare loading onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeDisabled();
  });
  test("renderiza campos email/contraseña y el submit", () => {
    render(<LoginForm onSubmit={() => {}} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  test("envía los valores cargados", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Email"), "med@test.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret");
    await act(async () => { await user.click(screen.getByRole("button", { name: "Ingresar" })); });
    expect(onSubmit).toHaveBeenCalledWith({
      email: "med@test.com",
      password: "secret",
    });
  });

  test("muestra el mensaje de error", () => {
    render(<LoginForm onSubmit={() => {}} error="Credenciales inválidas" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Credenciales inválidas");
  });
});
