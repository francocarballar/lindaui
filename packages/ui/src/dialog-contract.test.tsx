import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Dialog } from "./dialog";

// A controlled open notification must not invoke the consumer's close handler.
// Escape, visible composition and focus restoration use the real overlay in
// dialog.test.tsx and the browser suite.
vi.mock("@heroui/react", async (importOriginal) => ({
  ...await importOriginal<typeof import("@heroui/react")>(),
  ModalBackdrop: ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => (
    <button onClick={() => onOpenChange(true)}>Notify open</button>
  ),
}));

test("opening notifications do not close the controlled dialog", () => {
  const onClose = vi.fn();
  render(<Dialog open onClose={onClose}>Content</Dialog>);
  fireEvent.click(screen.getByRole("button", { name: "Notify open" }));
  expect(onClose).not.toHaveBeenCalled();
});
