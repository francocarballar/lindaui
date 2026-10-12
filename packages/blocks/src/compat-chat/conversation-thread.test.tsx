import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationThread, type GenericMessage } from "../chat";

const labels = { loading: "Loading messages", errorLoading: "Could not load", noMessages: "No messages", pollingFallback: "Polling" };
const messages: GenericMessage[] = [
  { id: "1", side: "left", text: "First", timestamp: "2026-09-12T10:00:00" },
  { id: "2", side: "right", text: "Second", timestamp: "2026-09-12T11:00:00" },
  { id: "3", side: "center", text: "Third", timestamp: "2026-09-13T11:00:00" },
];
const disconnect = vi.fn();
beforeEach(() => { vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect = disconnect; }); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("generic ConversationThread", () => {
  it("groups days and preserves the original pattern, polling label, and composer clearance", () => {
    const { container, rerender, unmount } = render(<ConversationThread messages={messages} labels={labels} showPollingFallback />);
    expect(screen.getByText("12/09/2026")).toBeInTheDocument();
    expect(screen.getByText("13/09/2026")).toBeInTheDocument();
    expect(screen.getByText("Polling")).toBeInTheDocument();
    expect(container.querySelector(".pb-20")).toBeInTheDocument();
    expect(container.querySelector(".dark\\:hidden")).toHaveStyle({ backgroundImage: "url('/images/chat-bg-light.png')" });
    rerender(<ConversationThread messages={messages} labels={labels} backgroundImage={null} />);
    expect(container.firstChild).toHaveClass("bg-background");
    expect(container.querySelector(".opacity-15")).toBeNull();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
  it("handles loading, errors, empty messages, and virtualized rendering independently", () => {
    const { rerender } = render(<ConversationThread messages={[]} labels={labels} isLoading isError />);
    expect(screen.getByText("Loading messages")).toBeInTheDocument();
    expect(screen.getByText("Could not load")).toBeInTheDocument();
    expect(screen.queryByText("No messages")).toBeNull();
    rerender(<ConversationThread messages={[]} labels={labels} />);
    expect(screen.getByText("No messages")).toBeInTheDocument();
    rerender(<ConversationThread messages={messages} labels={labels} renderMessages={(items, renderMessage) => <div data-testid="virtual-thread">{renderMessage(items[1]!)}</div>} />);
    expect(screen.getByTestId("virtual-thread")).toHaveTextContent("Second");
    expect(screen.queryByText("First")).toBeNull();
  });
});

it("settles initial scrolling, follows appended messages, and resets when switching conversations", () => {
  vi.useFakeTimers();
  const resizeCallbacks: (() => void)[] = [];
  const mutationCallbacks: (() => void)[] = [];
  const scrollTo = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resizeCallbacks.push(callback); }
    observe() {} unobserve() {} disconnect = disconnect;
  });
  vi.stubGlobal("MutationObserver", class {
    constructor(callback: () => void) { mutationCallbacks.push(callback); }
    observe() {} disconnect = disconnect;
  });
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; });
  const { rerender, unmount } = render(<ConversationThread messages={messages.slice(0, 1)} labels={labels} />);
  expect(resizeCallbacks.length).toBeGreaterThan(0);
  expect(mutationCallbacks.length).toBeGreaterThan(0);
  const scrollArea = screen.getByText("First").closest("[data-slot='scroll-shadow']") as HTMLElement;
  scrollArea.scrollTo = scrollTo;
  Object.defineProperty(scrollArea, "scrollHeight", { configurable: true, value: 500 });
  resizeCallbacks.forEach(callback => callback());
  mutationCallbacks.forEach(callback => callback());
  expect(scrollArea.scrollTop).toBe(500);
  vi.advanceTimersByTime(250);
  expect(disconnect).toHaveBeenCalled();
  // Observer notifications after disconnection must not disturb the position.
  scrollArea.scrollTop = 25;
  resizeCallbacks.forEach(callback => callback());
  mutationCallbacks.forEach(callback => callback());
  expect(scrollArea.scrollTop).toBe(25);
  rerender(<ConversationThread messages={messages.slice(0, 2)} labels={labels} />);
  frames.splice(0).forEach(callback => callback(0));
  expect(scrollTo).toHaveBeenCalledWith({ behavior: "smooth", top: 500 });
  rerender(<ConversationThread messages={[{ ...messages[0]!, id: "other-conversation" }]} labels={labels} />);
  expect(scrollArea.scrollTop).toBe(500);
  rerender(<ConversationThread messages={messages} labels={labels} />);
  expect(frames.length).toBeGreaterThan(0);
  unmount();
  scrollArea.scrollTop = 35;
  resizeCallbacks.forEach(callback => callback());
  mutationCallbacks.forEach(callback => callback());
  expect(scrollArea.scrollTop).toBe(35);
  // A queued append callback after unmount must safely ignore the cleared ref.
  frames.splice(0).forEach(callback => callback(0));
  vi.useRealTimers();
});
