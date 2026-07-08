"use client";
import { Button, type ButtonProps } from "./button.js";

/**
 * Icon-only button. Thin wrap over `./button` with `isIconOnly` forced on —
 * HeroUI v3's `Button` already supports it natively. `aria-label` is required
 * since icon-only buttons have no accessible text content otherwise.
 */
export interface IconButtonProps extends Omit<ButtonProps, "isIconOnly"> {
  "aria-label": string;
}

export function IconButton(props: IconButtonProps) {
  return <Button isIconOnly {...props} />;
}
