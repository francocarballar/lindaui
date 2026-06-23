"use client";
import { CloseButton as HeroCloseButton, type CloseButtonProps } from "@heroui/react";
export type { CloseButtonProps };
export function CloseButton(props: CloseButtonProps) {
  return <HeroCloseButton {...props} />;
}
