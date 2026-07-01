"use client";
import {
  NumberField,
  Label,
  NumberFieldGroup,
  NumberFieldInput,
  type NumberFieldProps,
} from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Token-driven like {@link Input}: style the field via the `--field-*` custom
 * properties. `className` is rejected so a class meant for the inner input
 * cannot silently land on the outer `NumberField`.
 */
export interface NumberInputProps
  extends Omit<NumberFieldProps, "children" | "className"> {
  label?: ReactNode;
}

export function NumberInput({ label, ...props }: NumberInputProps) {
  return (
    <NumberField {...props}>
      {label != null && <Label>{label}</Label>}
      <NumberFieldGroup>
        <NumberFieldInput />
      </NumberFieldGroup>
    </NumberField>
  );
}
