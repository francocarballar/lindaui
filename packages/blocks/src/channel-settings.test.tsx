import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { ChannelSettings } from "./channel-settings";

const channels = [
  { id: "device", label: "Device", status: "Connected", panel: <input aria-label="Device name" defaultValue="Desk" /> },
  { id: "mail", label: "Mail", status: "Action required", panel: <input aria-label="Mailbox" defaultValue="Inbox" /> },
  { id: "chat", label: "Chat", status: "Disconnected", isDisabled: true, panel: "Chat form" },
];

const animationsDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "getAnimations");

// Keep real HeroUI tabs; jsdom lacks layout observation and the Web Animations API.
beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] });
});
afterAll(() => {
  vi.unstubAllGlobals();
  if (animationsDescriptor) Object.defineProperty(Element.prototype, "getAnimations", animationsDescriptor);
  else Reflect.deleteProperty(Element.prototype, "getAnimations");
});

describe("ChannelSettings", () => {
  test("panel mounting order can differ from the tab order without changing selection", async () => {
    const { container } = render(<ChannelSettings
      channels={[{ ...channels[0]!, panelOrder: 1 }, { ...channels[1]!, panelOrder: 0 }]}
      navigationLabel="Connections"
    />);
    await act(async () => undefined);
    const panels = container.querySelectorAll("[data-slot=tabs-panel]");
    expect(panels[0]?.textContent).toBe("");
    expect(panels[0]?.querySelector("input")).toHaveAttribute("aria-label", "Mailbox");
    expect(panels[1]?.querySelector("input")).toHaveAttribute("aria-label", "Device name");
    expect(screen.getByRole("tab", { name: /Device.*Connected/ })).toHaveAttribute("aria-selected", "true");
  });

  test("renders arbitrary channels, their supplied statuses and disabled states", async () => {
    await act(async () => { render(<ChannelSettings channels={channels} navigationLabel="Connections" />); });
    expect(screen.getByRole("tablist", { name: "Connections" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: /Device.*Connected/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Chat.*Disconnected/ })).toHaveAttribute("aria-disabled", "true");
  });

  test("switching leaves both forms mounted and preserves unsaved input", async () => {
    render(<ChannelSettings channels={channels} navigationLabel="Connections" />);
    const user = userEvent.setup();
    const input = screen.getByRole("textbox", { name: "Device name" });
    await user.clear(input);
    await user.type(input, "Workstation");
    await user.click(screen.getByRole("tab", { name: /Mail.*Action required/ }));
    expect(input).toBeInTheDocument();
    expect(input.closest("[data-slot=tabs-panel]")).toHaveClass("hidden");
    expect(screen.getByRole("textbox", { name: "Mailbox" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /Device.*Connected/ }));
    expect(screen.getByRole("textbox", { name: "Device name" })).toHaveValue("Workstation");
  });

  test("controlled selection updates the panel active callback", async () => {
    const onSelect = vi.fn();
    function Controlled() {
      const [selected, setSelected] = useState("mail");
      return <ChannelSettings
        channels={[...channels.slice(0, 1), { ...channels[1]!, panel: (active) => <span>{active ? "Mail active" : "Mail paused"}</span> }]}
        navigationLabel="Connections"
        onSelect={(id) => { setSelected(id); onSelect(id); }}
        selected={selected}
      />;
    }
    await act(async () => { render(<Controlled />); });
    expect(screen.getByText("Mail active")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /Device.*Connected/ }));
    expect(onSelect).toHaveBeenCalledWith("device");
    expect(screen.getByText("Mail paused")).toBeInTheDocument();
  });
});
