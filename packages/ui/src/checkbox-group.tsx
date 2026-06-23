"use client";
import { CheckboxGroup as HeroCheckboxGroup, type CheckboxGroupProps } from "@heroui/react";
export type { CheckboxGroupProps };
export function CheckboxGroup(props: CheckboxGroupProps) {
  return <HeroCheckboxGroup {...props} />;
}
