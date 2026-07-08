import { describe, test, expect } from "vitest";
import type { GenericMessage, ConversationSummary } from "./chat-types";

describe("chat-types", () => {
  test("GenericMessage shape compiles with required fields", () => {
    const msg: GenericMessage = { id: "1", side: "incoming", sentAt: new Date() };
    expect(msg.id).toBe("1");
  });

  test("ConversationSummary shape compiles with required fields", () => {
    const conv: ConversationSummary = { id: "1", title: "Juan" };
    expect(conv.title).toBe("Juan");
  });
});
