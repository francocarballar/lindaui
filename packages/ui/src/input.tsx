"use client";
import {
  TextField,
  Label,
  Input as HeroInput,
  type TextFieldProps,
} from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Ergonomic single-component input. HeroUI v3 splits this into a RAC
 * `TextField` (state/validation), `Label`, and the `Input` primitive; this
 * wrapper composes them so callers get the flat `label`/`placeholder` API.
 */
export interface InputProps extends Omit<TextFieldProps, "children"> {
  label?: ReactNode;
  placeholder?: string;
}

export function Input({ label, placeholder, ...props }: InputProps) {
  return (
    <TextField {...props}>
      {label != null && <Label>{label}</Label>}
      <HeroInput placeholder={placeholder} />
    </TextField>
  );
}
