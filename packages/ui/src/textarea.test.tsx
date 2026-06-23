import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";
import { describe, test, expect } from "vitest";

describe("Textarea", () => {
  test("renders with label and accepts input", async () => {
    render(<Textarea label="Comentario" />);
    const el = screen.getByLabelText("Comentario");
    await userEvent.type(el, "hola");
    expect(el).toHaveValue("hola");
  });
});
