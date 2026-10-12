import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Badge, Button, Divider, IconButton, Input, SearchInput, Spinner, formatRelativeTime, useDebounce } from "./compat";

afterEach(() => vi.useRealTimers());
describe("legacy UI compatibility entry", () => {
  it("keeps button variants, icon prop and pending replacement", () => {
    const onPress = vi.fn();
    const { rerender } = render(<Button color="danger" variant="flat" onPress={onPress} startContent={<span>Before</span>} endContent={<span>After</span>}>Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("button--danger-soft");
    fireEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledOnce();
    rerender(<Button isLoading>Delete</Button>);
    expect(screen.queryByText("Delete")).toBeNull();
    rerender(<IconButton aria-label="Details" icon={<span>Icon</span>} />);
    expect(screen.getByRole("button", { name: "Details" })).toHaveClass("button--tertiary");
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });
  it("retains input-group anatomy, size classes, controlled callbacks and search clearing", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Input label="Name" value="Alex" size="sm" description="Display name" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveClass("h-8", "text-sm");
    expect(input.closest(".input-group")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "Rivera" } });
    expect(onValueChange).toHaveBeenCalledWith("Rivera");
    expect(input).toHaveValue("Alex");
    rerender(<SearchInput value="find" onValueChange={onValueChange} size="lg" placeholder="Search" />);
    expect(screen.getByRole("searchbox")).toHaveClass("h-12", "text-lg");
    fireEvent.click(screen.getByRole("button", { name: "Limpiar busqueda" }));
    expect(onValueChange).toHaveBeenCalledWith("");
  });
  it("preserves badge flat classes, separator orientation and spinner labels", () => {
    render(<><Badge color="primary">Active</Badge><Divider orientation="vertical" /><Spinner label="Loading data" /></>);
    expect(screen.getByText("Active").closest(".chip")).toHaveClass("bg-accent-soft", "rounded-full", "px-3");
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getByText("Loading data")).toBeInTheDocument();
  });
  it("keeps relative timestamps and the optional 300ms debounce default", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-11T12:00:00Z"));
    expect(formatRelativeTime("2026-10-11T10:00:00Z")).toBe("hace 2 horas");
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value), { initialProps: { value: "one" } });
    rerender({ value: "two" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("one");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("two");
    rerender({ value: "three" });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
