import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { EntitySwitcher } from "./entity-switcher";

const entities = [
  { identifier: "north", name: "North studio", description: "12 North St", region: "north" },
  { identifier: "south", name: "South studio", description: "34 South St", region: "south" },
];
const labels = { trigger: "Choose studio: North studio", menu: "Choose studio", section: "Studios", fallbackDescription: "No address", visiting: "Visiting" };

describe("EntitySwitcher", () => {
  test("renders nothing without a current entity", () => {
    const { container } = render(<EntitySwitcher entities={entities} labels={labels} onSelect={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("preserves selected indication and returns the full domain-neutral entity", async () => {
    const onSelect = vi.fn();
    render(<EntitySwitcher currentEntity={entities[0]} entities={entities} labels={labels} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: labels.trigger }));
    const menu = await screen.findByRole("menu", { name: labels.trigger });
    expect(within(menu).getByRole("menuitemradio", { name: /North studio/ })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(within(menu).getByRole("menuitemradio", { name: /South studio/ }));
    expect(onSelect).toHaveBeenCalledWith(entities[1]);
  });

  test("keyboard activates supplied visit action without invoking entity selection", async () => {
    const onAction = vi.fn();
    const onSelect = vi.fn();
    render(<EntitySwitcher
      currentEntity={entities[0]} entities={entities} labels={labels} onSelect={onSelect} isVisiting
      actions={[{ identifier: "exit", label: "Return to admin", onAction, className: "text-warning" }]}
    />);
    expect(screen.getByText("Visiting")).toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: labels.trigger });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const action = await screen.findByRole("menuitemradio", { name: "Return to admin" });
    action.focus();
    await userEvent.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("collapsed trigger hides labels but remains named, and expanded descriptions use the supplied fallback", () => {
    const { rerender } = render(<EntitySwitcher currentEntity={entities[0]} entities={entities} labels={labels} onSelect={vi.fn()} isCollapsed />);
    expect(screen.getByRole("button", { name: labels.trigger })).toBeInTheDocument();
    expect(screen.queryByText("North studio")).not.toBeInTheDocument();
    rerender(<EntitySwitcher currentEntity={{ ...entities[0]!, description: "" }} entities={entities} labels={labels} onSelect={vi.fn()} />);
    expect(screen.getByText("No address")).toBeInTheDocument();
  });
});
