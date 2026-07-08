import { render, screen, fireEvent } from "@testing-library/react";
import { ChatAvatar } from "./chat-avatar";
import { describe, test, expect, vi } from "vitest";

describe("ChatAvatar", () => {
  test("renders initials when there is no src", () => {
    render(<ChatAvatar name="María García" />);
    expect(screen.getByRole("img", { name: "María García" })).toBeInTheDocument();
    expect(screen.getByText("MG")).toBeInTheDocument();
  });

  test("renders a single-letter fallback doubled for one-word names", () => {
    render(<ChatAvatar name="Cher" />);
    expect(screen.getByText("CH")).toBeInTheDocument();
  });

  test("renders the image when src is provided", () => {
    render(<ChatAvatar name="Juan" src="https://example.com/a.jpg" />);
    const img = screen.getByRole("img", { name: "Juan" }).querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.com/a.jpg");
  });

  test("falls back to initials and calls onError when the image fails", () => {
    const onError = vi.fn();
    render(<ChatAvatar name="Juan Pérez" src="https://example.com/broken.jpg" onError={onError} />);
    const img = screen.getByRole("img", { name: "Juan Pérez" }).querySelector("img")!;
    fireEvent.error(img);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.getByText("JP")).toBeInTheDocument();
  });
});
