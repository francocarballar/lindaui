"use client";

import { QRCodeSVG } from "qrcode.react";
import type { ReactNode } from "react";

export type QRCodeType = "ascii" | "dataUrl" | "raw";

/** Keep provider-supplied images and terminal QR art intact; encode only raw values. */
export function detectQRCodeType(value: string): QRCodeType {
  if (value.startsWith("data:image")) return "dataUrl";
  if (value.includes("\n") && /[█▀▄]/.test(value)) return "ascii";
  return "raw";
}

export interface QRCodeImageProps {
  alt: string;
  className: string;
  height: number;
  src: string;
  width: number;
}

export interface QRCodeProps {
  value: string;
  alt: string;
  type?: QRCodeType;
  size?: number;
  imageSize?: number;
  level?: "L" | "M" | "Q" | "H";
  className?: string;
  /** Optional framework-specific image renderer. No framework dependency is required. */
  renderImage?: (props: QRCodeImageProps) => ReactNode;
}

export function QRCode({
  value,
  alt,
  type = detectQRCodeType(value),
  size = 170,
  imageSize = 180,
  level = "M",
  className,
  renderImage,
}: QRCodeProps) {
  if (type === "ascii") {
    return (
      <pre
        aria-label={alt}
        className={className ?? "font-mono text-[5px] text-black leading-[5px] sm:text-[6px] sm:leading-[6px]"}
        role="img"
        style={{ fontFamily: "monospace", letterSpacing: "-0.5px" }}
      >
        {value}
      </pre>
    );
  }
  if (type === "dataUrl") {
    const props: QRCodeImageProps = {
      alt,
      className: className ?? "h-full w-full object-contain",
      height: imageSize,
      src: value,
      width: imageSize,
    };
    return renderImage ? renderImage(props) : <img {...props} />;
  }
  return <QRCodeSVG aria-label={alt} className={className} level={level} role="img" size={size} value={value} />;
}
