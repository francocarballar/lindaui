"use client";
import { RadioGroup as HeroRadioGroup, type RadioGroupProps } from "@heroui/react";
export type { RadioGroupProps };
export function RadioGroup(props: RadioGroupProps) {
  return <HeroRadioGroup {...props} />;
}
