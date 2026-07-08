import { render, screen } from "@testing-library/react";
import { ConversationThread } from "./conversation-thread";
import type { GenericMessage } from "./chat-types";
import { describe, test, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe("ConversationThread", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-07-08T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows a loading spinner", () => {
    render(<ConversationThread messages={[]} loading />);
    expect(screen.getByLabelText("Cargando mensajes")).toBeInTheDocument();
  });

  test("shows the empty state when there are no messages", () => {
    render(<ConversationThread messages={[]} emptyTitle="Sin mensajes" />);
    expect(screen.getByText("Sin mensajes")).toBeInTheDocument();
  });

  test("groups messages by day and renders a divider per group", () => {
    const messages: GenericMessage[] = [
      { id: "1", side: "incoming", text: "Mensaje de ayer", sentAt: new Date("2026-07-07T08:00:00") },
      { id: "2", side: "outgoing", text: "Mensaje de hoy", sentAt: new Date("2026-07-08T08:00:00") },
    ];
    render(<ConversationThread messages={messages} />);
    expect(screen.getByRole("separator", { name: "Ayer" })).toBeInTheDocument();
    expect(screen.getByRole("separator", { name: "Hoy" })).toBeInTheDocument();
    expect(screen.getByText("Mensaje de ayer")).toBeInTheDocument();
    expect(screen.getByText("Mensaje de hoy")).toBeInTheDocument();
  });
});
