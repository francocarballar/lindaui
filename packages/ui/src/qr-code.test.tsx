import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { detectQRCodeType, QRCode } from "./qr-code";

describe("QRCode", () => {
  test.each([
    ["data:image/png;base64,abc", "dataUrl"],
    ["█▀▄\n▄██", "ascii"],
    ["pairing-token", "raw"],
    ["first line\nsecond line", "raw"],
  ] as const)("detects %s as %s", (value, type) => {
    expect(detectQRCodeType(value)).toBe(type);
  });

  test("encodes a raw token as an SVG with the original size", () => {
    render(<QRCode alt="Pairing code" value="pairing-token" />);
    expect(screen.getByRole("img", { name: "Pairing code" }).tagName).toBe("svg");
    expect(screen.getByRole("img")).toHaveAttribute("width", "170");
  });

  test("ASCII art is preserved verbatim, not encoded again", () => {
    const value = "█▀▄\n▄██";
    render(<QRCode alt="Pairing code" value={value} />);
    expect(screen.getByRole("img").tagName).toBe("PRE");
    expect(screen.getByRole("img").textContent).toBe(value);
  });

  test("data URLs are displayed as images, not encoded as QR payloads", () => {
    render(<QRCode alt="Pairing code" value="data:image/png;base64,abc" />);
    expect(screen.getByRole("img").tagName).toBe("IMG");
    expect(screen.getByRole("img")).toHaveAttribute("src", "data:image/png;base64,abc");
    expect(screen.getByRole("img")).toHaveAttribute("width", "180");
  });

  test("framework image slots receive the unmodified image and sizing", () => {
    const renderImage = vi.fn((props) => <img {...props} data-framework="custom" />);
    render(<QRCode alt="Pairing code" renderImage={renderImage} value="data:image/png;base64,abc" />);
    expect(renderImage).toHaveBeenCalledWith({ alt: "Pairing code", className: "h-full w-full object-contain", height: 180, width: 180, src: "data:image/png;base64,abc" });
    expect(screen.getByRole("img")).toHaveAttribute("data-framework", "custom");
  });
});
