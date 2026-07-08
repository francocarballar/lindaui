import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";
import { describe, test, expect } from "vitest";

describe("Input", () => {
  test("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  test("accepts typed value", async () => {
    render(<Input label="Email" />);
    const el = screen.getByLabelText("Email");
    await userEvent.type(el, "test@ts.com");
    expect(el).toHaveValue("test@ts.com");
  });

  test("disabled blocks interaction", () => {
    render(<Input label="Email" isDisabled />);
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  test("renders description text", () => {
    render(<Input label="Email" description="Usamos esto para notificarte" />);
    expect(screen.getByText("Usamos esto para notificarte")).toBeInTheDocument();
  });

  test("renders error message when invalid", () => {
    render(<Input label="Email" isInvalid errorMessage="Email inválido" />);
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
  });

  test("error message stays hidden while not invalid", () => {
    render(<Input label="Email" errorMessage="Email inválido" />);
    expect(screen.queryByText("Email inválido")).not.toBeInTheDocument();
  });

  test("renders startContent and endContent addons", () => {
    render(
      <Input
        label="Precio"
        startContent={<span>$</span>}
        endContent={<span>USD</span>}
      />,
    );
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByLabelText("Precio")).toBeInTheDocument();
  });

  test("without addons stays typeable (regression: no InputGroup wrapper)", async () => {
    render(<Input label="Email" />);
    const el = screen.getByLabelText("Email");
    await userEvent.type(el, "a@b.com");
    expect(el).toHaveValue("a@b.com");
  });
});
