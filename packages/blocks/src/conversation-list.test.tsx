import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationList } from "./conversation-list";
import type { ConversationSummary } from "./chat-types";
import { describe, test, expect, vi, beforeAll } from "vitest";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const conversations: ConversationSummary[] = [
  { id: "1", title: "Juan" },
  { id: "2", title: "María" },
];

describe("ConversationList", () => {
  test("renders each conversation", () => {
    render(<ConversationList conversations={conversations} />);
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("María")).toBeInTheDocument();
  });

  test("fires onSelect with the conversation id", async () => {
    const onSelect = vi.fn();
    render(<ConversationList conversations={conversations} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Juan"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });

  test("shows a loading spinner instead of the list", () => {
    render(<ConversationList conversations={conversations} loading />);
    expect(screen.getByLabelText("Cargando")).toBeInTheDocument();
    expect(screen.queryByText("Juan")).not.toBeInTheDocument();
  });

  test("shows empty content when there are no conversations", () => {
    render(<ConversationList conversations={[]} />);
    expect(screen.getByText("Sin conversaciones")).toBeInTheDocument();
  });

  test("renders the search field with the given value", () => {
    render(<ConversationList conversations={conversations} searchValue="jua" onSearchChange={() => {}} />);
    expect(screen.getByLabelText("Buscar")).toHaveValue("jua");
  });
});
