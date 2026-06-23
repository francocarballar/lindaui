"use client";
import { ToggleButton as HeroToggleButton, type ToggleButtonProps } from "@heroui/react";
export type { ToggleButtonProps };
export function ToggleButton(props: ToggleButtonProps) {
  return <HeroToggleButton {...props} />;
}
