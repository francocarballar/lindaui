import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatAvatar, ChatHeader, ChatLayout, ConversationList, EmptyChatView, MessageComposer } from "../chat";
import { TIME_GROUP_ORDER } from "./time-grouping";

beforeEach(() => vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} }));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe("generic chat presentation", () => {
  it("preserves layout breakpoints and header slots", () => {
    const { container, rerender } = render(<ChatLayout sidebar={<span>Sidebar</span>} main={<ChatHeader title="Alex" subtitle="Available" avatar={<span>Avatar</span>} actions={<button>Details</button>} />} detail={<span>Detail</span>} />);
    expect(screen.getByText("Sidebar").parentElement).toHaveClass("flex", "w-full", "md:w-[350px]");
    expect(screen.getByText("Alex").closest("h3")).toHaveClass("truncate", "text-sm");
    expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
    expect(screen.getByText("Detail").parentElement).toHaveClass("hidden", "lg:flex", "w-[320px]");
    expect(container.firstChild).toHaveClass("h-full", "overflow-hidden");
    rerender(<ChatLayout sidebar={<span>Sidebar</span>} main={<span>Main</span>} selectedChatId="id" />);
    expect(screen.getByText("Sidebar").parentElement).toHaveClass("hidden");
    expect(screen.getByText("Main").parentElement).toHaveClass("flex", "md:flex");
  });
  it("keeps avatar initials and exact empty-state styling", () => {
    const { rerender } = render(<ChatAvatar name="  Alex  Rivera " className="outer" classNames={{ base: "base", fallback: "fallback" }} />);
    expect(screen.getByText("AR")).toHaveClass("fallback");
    expect(screen.getByText("AR").parentElement).toHaveClass("outer", "base");
    rerender(<EmptyChatView title="Select a conversation" description="Messages appear here" />);
    expect(screen.getByText("Select a conversation")).toHaveClass("font-semibold", "text-lg");
    expect(screen.getByText("Messages appear here")).toHaveClass("text-muted", "text-sm");
  });
  it("groups conversations newest period first and delegates search, avatars, and selection", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-11T12:00:00"));
    const onSearchChange = vi.fn();
    const onItemSelect = vi.fn();
    const periods = Object.fromEntries(TIME_GROUP_ORDER.map((group) => [group, group])) as Record<(typeof TIME_GROUP_ORDER)[number], string>;
    const props = { items: [
      { id: "old", title: "Yesterday", timestamp: "2026-10-10T09:00:00", isSelected: true },
      { id: "new", title: "Today", timestamp: "2026-10-11T09:00:00", preview: "Hello", unreadCount: 3, badge: <span>Active</span> },
    ], searchValue: "hello", searchPlaceholder: "Find a conversation", onSearchChange, onItemSelect, labels: { loading: "Loading", periods, emptyPreview: "No messages" }, renderAvatar: () => <span>Avatar</span> };
    const { container, rerender } = render(<ConversationList {...props} />);
    const titles = screen.getAllByRole("heading").map((heading) => heading.textContent);
    expect(titles).toEqual(["Today", "Yesterday"]);
    const yesterday = screen.getByRole("button", { name: /Yesterday/ });
    expect(yesterday).toHaveClass("bg-blue-50", "dark:bg-blue-950/20");
    expect(within(yesterday).getByText("No messages")).toBeInTheDocument();
    fireEvent.click(yesterday);
    expect(onItemSelect).toHaveBeenCalledWith("old");
    fireEvent.change(screen.getByPlaceholderText("Find a conversation"), { target: { value: "updated" } });
    expect(onSearchChange).toHaveBeenCalledWith("updated");
    fireEvent.click(container.querySelector(".input-group__suffix button") ?? screen.getAllByRole("button")[0]!);
    expect(onSearchChange).toHaveBeenCalledWith("");
    const renderItems = vi.fn((items, renderItem) => <div data-testid="virtual-list">{renderItem(items[0])}</div>);
    rerender(<ConversationList {...props} renderItems={renderItems} />);
    expect(renderItems).toHaveBeenCalled();
    expect(within(screen.getByTestId("virtual-list")).getByRole("heading")).toHaveTextContent("Yesterday");
  });
  it("keeps composer controlled and respects Shift+Enter and sending", () => {
    const onValueChange = vi.fn();
    const onSend = vi.fn();
    const props = { value: "Hello", placeholder: "Write a message", onValueChange, onSend };
    const { rerender } = render(<MessageComposer {...props} />);
    const input = screen.getByRole("textbox", { name: "Write a message" });
    fireEvent.change(input, { target: { value: "Edited" } });
    expect(onValueChange).toHaveBeenCalledWith("Edited");
    expect(input).toHaveValue("Hello");
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledTimes(1);
    rerender(<MessageComposer {...props} isSending />);
    expect(input).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledTimes(1);
    rerender(<MessageComposer {...props} value="   " />);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(input.closest(".backdrop-blur-2xl")).toHaveClass("lg:w-[70%]", "dark:bg-slate-800/40");
  });
});
