"use client";
import {
  TextField,
  Label,
  TextArea as HeroTextArea,
  type TextFieldProps,
} from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Token-driven like {@link Input}: style the field via the `--field-*` custom
 * properties. `className` is rejected so a class meant for the `<textarea>`
 * cannot silently land on the outer `TextField`.
 */
export interface TextareaProps
  extends Omit<TextFieldProps, "children" | "className"> {
  label?: ReactNode;
  placeholder?: string;
}

export function Textarea({ label, placeholder, ...props }: TextareaProps) {
  return (
    <TextField {...props}>
      {label != null && <Label>{label}</Label>}
      <HeroTextArea placeholder={placeholder} />
    </TextField>
  );
}
