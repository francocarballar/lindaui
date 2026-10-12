import { Children, isValidElement, type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageBubble } from "../chat";

function luminance(hex: string) {
  const channels = hex.match(/\w\w/g)!.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}
function color(classes: string, property: string, dark: boolean) {
  const colors = [...classes.matchAll(new RegExp(`(?:^| )(dark:)?${property}-\\[#([a-f0-9]+)\\]`, "g"))];
  return colors.find((match) => Boolean(match[1]) === dark)?.[2] ?? colors.find((match) => !match[1])?.[2];
}
describe("generic MessageBubble", () => {
  for (const side of ["left", "right"] as const) for (const dark of [false, true]) {
    it(`preserves readable metadata for ${side}, ${dark ? "dark" : "light"}`, () => {
      const classes: string[] = [];
      function visit(node: ReactNode) {
        Children.forEach(node, (child) => {
          if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) return;
          if (child.props.className) classes.push(child.props.className);
          visit(child.props.children);
        });
      }
      visit(MessageBubble({ message: { authorTag: "IA/manual", id: "synthetic", side, text: "Clase de prueba", timestamp: "2026-09-12T12:30:00Z" } }));
      const bubble = classes.find((value) => value.includes("relative p-3"))!;
      const metadata = classes.find((value) => value.includes("absolute right-0 bottom-0"))!;
      const a = luminance(color(metadata, "text", dark)!);
      const b = luminance(color(bubble, "bg", dark) ?? "ffffff");
      expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5);
      expect(classes).not.toContain("opacity-60");
      expect(classes).toContain("invisible text-[10px]");
    });
  }
  it("renders system messages without metadata and keeps PDF downloads intact", () => {
    const { rerender } = render(<MessageBubble message={{ id: "system", side: "center", text: "Conversation started", timestamp: new Date() }} />);
    expect(screen.getByText("Conversation started")).toHaveClass("rounded-full", "bg-surface-secondary");
    expect(document.querySelector(".invisible")).toBeNull();
    rerender(<MessageBubble message={{ id: "pdf", side: "right", text: "Document", timestamp: new Date(), media: { kind: "pdf", url: "/document.pdf", label: "Schedule.pdf" } }} />);
    expect(screen.getByRole("link", { name: /PDF.*Schedule\.pdf/ })).toHaveAttribute("download");
    expect(screen.getByRole("link")).toHaveAttribute("href", "/document.pdf");
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  });
});
