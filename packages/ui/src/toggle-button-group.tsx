"use client";
import {
  ToggleButtonGroup as HeroToggleButtonGroup,
  type ToggleButtonGroupProps,
} from "@heroui/react";
export type { ToggleButtonGroupProps };
export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return <HeroToggleButtonGroup {...props} />;
}
