"use client";
import {
  TextField,
  Label,
  TextArea as HeroTextArea,
  type TextFieldProps,
} from "@heroui/react";
import type { ReactNode } from "react";

export interface TextareaProps extends Omit<TextFieldProps, "children"> {
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
