"use client";
import {
  NumberField,
  Label,
  NumberFieldGroup,
  NumberFieldInput,
  type NumberFieldProps,
} from "@heroui/react";
import type { ReactNode } from "react";

export interface NumberInputProps extends Omit<NumberFieldProps, "children"> {
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
