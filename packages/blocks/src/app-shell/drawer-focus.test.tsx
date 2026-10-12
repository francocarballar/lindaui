import { act, fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { expect, test, vi } from "vitest";
import { useDrawerFocus } from "./drawer-focus";

test("drawer traps focus at both ends and ignores closed or portaled key events", () => {
  const close = vi.fn();
  function Demo({ open }: { open: boolean }) {
    const { drawerRef, triggerRef, onKeyDown } = useDrawerFocus(open, close);
    return <><button ref={triggerRef}>Open drawer</button><aside ref={drawerRef} onKeyDown={onKeyDown}>
      <button>First</button><button aria-disabled="true">Excluded</button>
      <span aria-hidden="true"><button>Hidden</button></span><button>Last</button>
      {createPortal(<button>Portal</button>, document.body)}
    </aside></>;
  }
  const { rerender } = render(<Demo open />);
  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("button", { name: "First" }), { key: "Tab", shiftKey: true });
  expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("button", { name: "Last" }), { key: "Tab" });
  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("button", { name: "First" }), { key: "Tab" });
  expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  act(() => screen.getByRole("button", { name: "Portal" }).focus());
  fireEvent.keyDown(screen.getByRole("button", { name: "Portal" }), { key: "Escape" });
  expect(close).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole("button", { name: "First" }), { key: "Escape" });
  expect(close).toHaveBeenCalledTimes(1);
  rerender(<Demo open={false} />);
  expect(screen.getByRole("button", { name: "Open drawer" })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("button", { name: "First" }), { key: "Escape" });
  expect(close).toHaveBeenCalledTimes(1);
});
