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
});
