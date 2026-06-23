import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "./field";
import { describe, test, expect, vi } from "vitest";

const schema = z.object({ name: z.string().min(1, "Requerido") });

function Wrapper({ onSubmit = vi.fn() }: { onSubmit?: () => void }) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field control={control} name="name" label="Nombre" hint="Tu nombre completo">
        {({ field, invalid }) => (
          <input {...field} aria-label="Nombre" aria-invalid={invalid} />
        )}
      </Field>
      <button type="submit">Enviar</button>
    </form>
  );
}

describe("Field", () => {
  test("renders label", () => {
    render(<Wrapper />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  test("renders hint when no error", () => {
    render(<Wrapper />);
    expect(screen.getByText("Tu nombre completo")).toBeInTheDocument();
  });

  test("shows validation error and hides hint on submit empty", async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("Requerido")).toBeInTheDocument();
    expect(screen.queryByText("Tu nombre completo")).not.toBeInTheDocument();
  });

  test("passes invalid=true to child when errored", async () => {
    render(<Wrapper />);
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await screen.findByText("Requerido");
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("aria-invalid", "true");
  });
});
