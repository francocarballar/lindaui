import { act, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, test, vi } from "vitest";

const callbacks = vi.hoisted(() => ({
  buttons: new Map<string, () => void | Promise<void>>(),
  onOpenChange: (_open: boolean) => {},
}));
// Isolate the upstream callback contract; real modal behavior is tested separately.
vi.mock("@lindaui/ui/compound", () => {
  function Part({ children }: { children?: ReactNode }) { return <div>{children}</div>; }
  return {
    Button: ({ children, onPress, variant }: { children: ReactNode; onPress: () => void; variant: string }) => {
      callbacks.buttons.set(variant, onPress);
      return <button onClick={onPress}>{children}</button>;
    },
    Spinner: () => <span>Pending</span>,
    Modal: {
      Backdrop: ({ children, onOpenChange, isOpen }: { children: ReactNode; onOpenChange: (open: boolean) => void; isOpen: boolean }) => {
        callbacks.onOpenChange = onOpenChange;
        return <div data-testid="backdrop" data-open={isOpen}>{children}</div>;
      },
      Container: Part, Dialog: Part, Header: Part, Heading: Part, Body: Part, Footer: Part,
    },
  };
});
import { ConnectedPanel } from "./connected-panel";

test("disconnect ignores duplicate and dismiss callbacks while a request is pending", async () => {
  let finish!: () => void;
  const operation = new Promise<void>(resolve => { finish = resolve; });
  const disconnect = vi.fn(() => operation);
  const labels = { disconnectHint: "Session", disconnect: "Disconnect", disconnecting: "Disconnecting", disconnectError: "Failed", confirmTitle: "Confirm", confirmDescription: "Close session", cancel: "Cancel" };
  render(<ConnectedPanel details={[]} labels={labels} onDisconnect={disconnect} />);
  act(() => callbacks.buttons.get("danger-soft")!());
  let pending!: Promise<void>;
  act(() => {
    pending = callbacks.buttons.get("danger")!() as Promise<void>;
    callbacks.buttons.get("danger")!();
    callbacks.onOpenChange(false);
  });
  expect(disconnect).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("backdrop")).toHaveAttribute("data-open", "true");
  await act(async () => { finish(); await pending; });
  expect(screen.getByTestId("backdrop")).toHaveAttribute("data-open", "false");
  act(() => callbacks.onOpenChange(true));
  expect(screen.getByTestId("backdrop")).toHaveAttribute("data-open", "true");
});
