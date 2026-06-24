import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { ListItem } from "./list-item";

describe("ListItem", () => {
  test("renders a button with aria-pressed=false by default", () => {
    render(<ListItem title="Test title" />);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  test("aria-pressed reflects selected prop", () => {
    render(<ListItem title="Test title" selected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  test("clicking fires onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ListItem title="Test title" onSelect={onSelect} />);
    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  test("renders title and subtitle", () => {
    render(<ListItem title="My Title" subtitle="My subtitle" />);
    expect(screen.getByText("My Title")).toBeInTheDocument();
    expect(screen.getByText("My subtitle")).toBeInTheDocument();
  });

  test("renders badge label when provided", () => {
    render(<ListItem title="Test" badge={{ label: "Activo", variant: "success" }} />);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  test("does not render badge when not provided", () => {
    render(<ListItem title="Test" />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
