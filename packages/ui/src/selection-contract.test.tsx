import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Select } from "./select";
import { ComboBox } from "./combobox";

// React Aria's selection callbacks may emit null when a collection clears.
// Exercise that boundary explicitly; normal option interaction is tested with
// the real components in select.test.tsx and combobox.test.tsx.
vi.mock("@heroui/react", async (importOriginal) => {
  const upstream = await importOriginal<typeof import("@heroui/react")>();
  const ClearedCollection = ({ onSelectionChange }: { onSelectionChange: (key: null) => void }) => (
    <button onClick={() => onSelectionChange(null)}>Clear selection</button>
  );
  return { ...upstream, Select: ClearedCollection, ComboBox: ClearedCollection };
});

describe("selection callback contract", () => {
  test.each([Select, ComboBox])("does not emit the string null when the collection clears", (Component) => {
    const onChange = vi.fn();
    render(<Component items={[]} aria-label="Collection" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
