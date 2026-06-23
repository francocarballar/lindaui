"use client";
import { InputGroup as HeroInputGroup, type InputGroupProps } from "@heroui/react";
export type { InputGroupProps };

/** Layout container for composing inputs with leading/trailing addons. */
export function InputGroup(props: InputGroupProps) {
  return <HeroInputGroup {...props} />;
}
