import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { CommandPalette } from "./command-palette";
import type { CommandPaletteProps } from "./command-palette";

// jsdom has no layout observer; keep the real ScrollShadow and all React Aria controls.
beforeAll(() => vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
}));
afterAll(() => vi.unstubAllGlobals());

const items = [
  { identifier: "alpha", name: "Alpha", description: "North studio" },
  { identifier: "beta", name: "Beta", description: "South studio" },
  { identifier: "gamma", name: "Gamma", description: "North office" },
];
function renderPalette(props: Partial<CommandPaletteProps> = {}) {
  return render(<CommandPalette isOpen items={items} onClose={vi.fn()} onSelect={vi.fn()} {...props} />);
}

describe("CommandPalette", () => {
  test("closed palettes do not expose a dialog", () => {
    renderPalette({ isOpen: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("groups recents first without duplication and keeps collection order", async () => {
    renderPalette({ recentIds: ["gamma", "alpha", "missing"], recentLabel: "Visited", allItemsLabel: "Everything else" });
    const list = await screen.findByRole("listbox", { name: "Search" });
    expect(within(list).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "AAlphaNorth studio", "GGammaNorth office", "BBetaSouth studio",
    ]);
    expect(within(list).getByText("Visited")).toBeInTheDocument();
    expect(within(list).getByText("Everything else")).toBeInTheDocument();
  });

  test("searches name and description case-insensitively and renders a localized empty state", async () => {
    renderPalette({ renderEmptyState: (query) => <p>No matches: {query}</p> });
    const input = await screen.findByRole("textbox", { name: "Search" });
    await userEvent.type(input, "NORTH");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.queryByRole("option", { name: /Beta/ })).not.toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "beta");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await userEvent.clear(input);
    await userEvent.type(input, "zzzz");
    expect(await screen.findByText("No matches: zzzz")).toBeInTheDocument();
  });

  test("keyboard selection returns the item and resets search without taking over the caller's open state", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    renderPalette({ onSelect, onClose });
    const input = await screen.findByRole("textbox", { name: "Search" });
    await userEvent.type(input, "beta");
    const option = screen.getByRole("option", { name: /Beta/ });
    option.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(items[1]);
    expect(onClose).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("Escape calls onClose and clears the search on the next open", async () => {
    const onClose = vi.fn();
    const { rerender } = renderPalette({ onClose });
    const input = await screen.findByRole("textbox", { name: "Search" });
    await userEvent.type(input, "alpha");
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(input).toHaveValue(""));
    rerender(<CommandPalette isOpen={false} items={items} onClose={onClose} onSelect={vi.fn()} />);
    rerender(<CommandPalette isOpen items={items} onClose={onClose} onSelect={vi.fn()} />);
    expect(await screen.findByRole("textbox", { name: "Search" })).toHaveValue("");
  });
});
