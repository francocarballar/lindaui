import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Badge, Button, Divider, IconButton, Input, SearchInput, Spinner, formatRelativeTime, useDebounce } from "./compat";

afterEach(() => vi.useRealTimers());
describe("legacy UI compatibility entry", () => {
  it.each([
    ["primary", "solid", "primary"], ["secondary", "solid", "secondary"],
    ["danger", "solid", "danger"], ["danger", "faded", "danger-soft"],
    ["primary", "ghost", "ghost"], ["primary", "bordered", "outline"],
    ["primary", "light", "tertiary"], ["primary", "flat", "tertiary"],
    ["primary", "faded", "tertiary"], ["primary", "shadow", "primary"],
  ] as const)("maps button %s/%s to %s", (color, variant, expected) => {
    render(<Button color={color} variant={variant}>Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass(`button--${expected}`);
  });
  it.each([
    ["primary", "solid", "primary"], ["secondary", "shadow", "secondary"],
    ["danger", "solid", "danger"], ["danger", "flat", "danger-soft"],
    ["danger", "faded", "danger-soft"], ["primary", "ghost", "ghost"],
    ["primary", "bordered", "outline"], ["default", "light", "tertiary"],
  ] as const)("maps icon button %s/%s to %s", (color, variant, expected) => {
    render(<IconButton aria-label="Action" icon={<span>Icon</span>} color={color} variant={variant} />);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass(`button--${expected}`);
  });
  it("supports standalone inputs without visible labels, affixes and invalid states", () => {
    const { rerender } = render(<Input aria-label="Standalone" placeholder="Standalone" startContent={null} endContent={null} />);
    expect(screen.getByRole("textbox").closest(".input-group")).toBeNull();
    rerender(<Input label="Code" startContent={<span>Prefix</span>} endContent={<span>Suffix</span>} isInvalid errorMessage="Invalid code" />);
    expect(screen.getByText("Prefix")).toBeInTheDocument();
    expect(screen.getByText("Suffix")).toBeInTheDocument();
    expect(screen.getByText("Invalid code")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Code" })).toHaveAttribute("aria-invalid", "true");
  });
  it("hides search clearing when empty or explicitly disabled and allows no callback", () => {
    const { rerender } = render(<SearchInput aria-label="Search" />);
    expect(screen.queryByRole("button", { name: "Limpiar busqueda" })).toBeNull();
    rerender(<SearchInput aria-label="Search" value="term" isClearable={false} />);
    expect(screen.queryByRole("button", { name: "Limpiar busqueda" })).toBeNull();
    rerender(<SearchInput aria-label="Search" value="term" />);
    fireEvent.click(screen.getByRole("button", { name: "Limpiar busqueda" }));
    expect(screen.getByRole("searchbox")).toHaveValue("term");
  });
  it("supports badge and spinner defaults, alternate colors and no label", () => {
    const { rerender } = render(<><Badge>Default</Badge><Divider /><Spinner /></>);
    expect(screen.getByText("Default").closest(".chip")).toHaveClass("bg-default-soft");
    expect(screen.getByRole("separator")).not.toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    rerender(<><Badge variant="solid">Solid</Badge><Spinner color="default" label="" /><Spinner color="danger" label="Error" /></>);
    expect(screen.getByText("Solid").closest(".chip")).toHaveClass("chip--primary");
    expect(screen.queryByText("Cargando...")).toBeNull();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });
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
    rerender(<SearchInput aria-label="Search" value="find" onValueChange={onValueChange} size="lg" placeholder="Search" />);
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
