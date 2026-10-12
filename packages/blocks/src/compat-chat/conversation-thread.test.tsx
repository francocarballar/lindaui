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
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

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
