import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationListItem } from "./conversation-list-item";
import type { ConversationSummary } from "./chat-types";
import { describe, test, expect, vi } from "vitest";

const conversation: ConversationSummary = {
  id: "1",
  title: "Juan Pérez",
  subtitle: "Último mensaje…",
  unreadCount: 3,
};

describe("ConversationListItem", () => {
  test("renders title, subtitle and unread count", () => {
    render(<ConversationListItem conversation={conversation} />);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Último mensaje…")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("fires onSelect when clicked", async () => {
    const onSelect = vi.fn();
    render(<ConversationListItem conversation={conversation} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test("marks the button pressed when selected", () => {
    render(<ConversationListItem conversation={conversation} selected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });
});
