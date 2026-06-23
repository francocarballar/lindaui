"use client";
import { SwitchGroup as HeroSwitchGroup, type SwitchGroupProps } from "@heroui/react";
export type { SwitchGroupProps };
export function SwitchGroup(props: SwitchGroupProps) {
  return <HeroSwitchGroup {...props} />;
}
