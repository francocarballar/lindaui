import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageBubble } from "./message-bubble";
import type { GenericMessage } from "./chat-types";
import { describe, test, expect, vi } from "vitest";

const base: GenericMessage = {
  id: "1",
  side: "outgoing",
  text: "Hola!",
  sentAt: new Date("2026-07-08T09:05:00"),
};

describe("MessageBubble", () => {
  test("renders text content", () => {
    render(<MessageBubble message={base} />);
    expect(screen.getByText("Hola!")).toBeInTheDocument();
  });

  test("renders a read receipt icon for outgoing read messages", () => {
    render(<MessageBubble message={{ ...base, status: "read" }} />);
    expect(screen.getByLabelText("Leído")).toBeInTheDocument();
  });

  test("does not render a status icon for incoming messages", () => {
    render(<MessageBubble message={{ ...base, side: "incoming", status: "read" }} />);
    expect(screen.queryByLabelText("Leído")).not.toBeInTheDocument();
  });

  test("renders an image message and fires onImageClick", async () => {
    const onImageClick = vi.fn();
    const message: GenericMessage = {
      ...base,
      text: undefined,
      media: { kind: "image", url: "https://example.com/photo.jpg" },
    };
    render(<MessageBubble message={message} onImageClick={onImageClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onImageClick).toHaveBeenCalledWith("https://example.com/photo.jpg");
  });

  test("renders a pdf message as a link", () => {
    const message: GenericMessage = {
      ...base,
      text: undefined,
      media: { kind: "pdf", url: "https://example.com/doc.pdf", name: "Contrato" },
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByRole("link", { name: "Contrato" })).toHaveAttribute(
      "href",
      "https://example.com/doc.pdf",
    );
  });
});
