import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { FieldArrayForm } from "./field-array-form";

const OPTIONS = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

describe("FieldArrayForm", () => {
  test("renders the name field", () => {
    render(<FieldArrayForm onSubmit={vi.fn()} options={OPTIONS} />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
  });

  test("renders entries label and add button", () => {
    render(<FieldArrayForm onSubmit={vi.fn()} options={OPTIONS} />);
    expect(screen.getByText("Entradas")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /agregar entrada/i }),
    ).toBeInTheDocument();
  });

  test("clicking add button appends a key/value row", async () => {
    const user = userEvent.setup();
    render(
      <FieldArrayForm
        onSubmit={vi.fn()}
        options={OPTIONS}
        keyPlaceholder="Clave"
        valuePlaceholder="Valor"
      />,
    );

    const addBtn = screen.getByRole("button", { name: /agregar entrada/i });

    // Initially no rows
    expect(screen.queryByLabelText("Clave 1")).not.toBeInTheDocument();

    await user.click(addBtn);

    // Now one row appears
    expect(screen.getByLabelText("Clave 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor 1")).toBeInTheDocument();
  });

  test("clicking add twice then remove drops a row", async () => {
    const user = userEvent.setup();
    render(
      <FieldArrayForm
        onSubmit={vi.fn()}
        options={OPTIONS}
        removeLabel="Eliminar entrada"
      />,
    );

    const addBtn = screen.getByRole("button", { name: /agregar entrada/i });
    await user.click(addBtn);
    await user.click(addBtn);

    // Two rows
    expect(screen.getAllByLabelText(/Clave \d/)).toHaveLength(2);

    // Remove first row
    const removeBtns = screen.getAllByRole("button", {
      name: "Eliminar entrada",
    });
    await user.click(removeBtns[0]);

    // One row left
    expect(screen.getAllByLabelText(/Clave \d/)).toHaveLength(1);
  });

  test("submitting fires onSubmit with name and default category", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <FieldArrayForm
        onSubmit={onSubmit}
        options={OPTIONS}
        nameLabel="Nombre"
        submitLabel="Guardar"
      />,
    );

    const nameInput = screen.getByLabelText("Nombre");
    await user.click(nameInput);
    await user.type(nameInput, "Mi nombre");

    const submitBtn = screen.getByRole("button", { name: "Guardar" });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as {
      category: string;
      name: string;
      entries: unknown[];
    };
    expect(payload.name).toBe("Mi nombre");
    // Default category is the first option's value
    expect(payload.category).toBe("a");
    expect(payload.entries).toEqual([]);
  });

  test("submitting with entries fires onSubmit with entry data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <FieldArrayForm
        onSubmit={onSubmit}
        options={OPTIONS}
        nameLabel="Nombre"
        keyPlaceholder="Clave"
        valuePlaceholder="Valor"
        submitLabel="Guardar"
      />,
    );

    // Type name
    await user.type(screen.getByLabelText("Nombre"), "Test");

    // Add one entry
    await user.click(screen.getByRole("button", { name: /agregar entrada/i }));

    await user.type(screen.getByLabelText("Clave 1"), "k1");
    await user.type(screen.getByLabelText("Valor 1"), "v1");

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as {
      entries: { key: string; value: string }[];
    };
    expect(payload.entries).toHaveLength(1);
    expect(payload.entries[0].key).toBe("k1");
    expect(payload.entries[0].value).toBe("v1");
  });

  test("accepts custom labels", () => {
    render(
      <FieldArrayForm
        onSubmit={vi.fn()}
        options={OPTIONS}
        categoryLabel="Tipo"
        nameLabel="Título"
        submitLabel="Enviar"
      />,
    );
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });
});
