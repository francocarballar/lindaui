"use client";
import {
  TextField,
  Label,
  Input as HeroInput,
  InputGroup,
  Description,
  FieldError,
  type TextFieldProps,
} from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Ergonomic single-component input. HeroUI v3 splits this into a RAC
 * `TextField` (state/validation), `Label`, and the `Input` primitive; this
 * wrapper composes them so callers get the flat `label`/`placeholder` API.
 *
 * Surface styling is token-driven: override the `--field-*` custom properties,
 * not `className`. `className` is rejected on purpose — spreading it here would
 * land it on the outer `TextField`, never the `<input>`, a silent miss. Making
 * it a compile error forces the token path.
 *
 * `startContent`/`endContent` route through `InputGroup.Prefix`/`.Suffix` (the
 * RAC row that carries icons/addons); without either, the plain `Input`
 * primitive is used instead of introducing an unnecessary wrapper row.
 */
export interface InputProps
  extends Omit<TextFieldProps, "children" | "className"> {
  label?: ReactNode;
  placeholder?: string;
  description?: ReactNode;
  /** Rendered via RAC `FieldError`, which only shows while `isInvalid` is set. */
  errorMessage?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
}

export function Input({
  label,
  placeholder,
  description,
  errorMessage,
  startContent,
  endContent,
  ...props
}: InputProps) {
  return (
    <TextField {...props}>
      {label != null && <Label>{label}</Label>}
      {startContent != null || endContent != null ? (
        <InputGroup>
          {startContent != null && <InputGroup.Prefix>{startContent}</InputGroup.Prefix>}
          <InputGroup.Input placeholder={placeholder} />
          {endContent != null && <InputGroup.Suffix>{endContent}</InputGroup.Suffix>}
        </InputGroup>
      ) : (
        <HeroInput placeholder={placeholder} />
      )}
      {description != null && <Description>{description}</Description>}
      {errorMessage != null && <FieldError>{errorMessage}</FieldError>}
    </TextField>
  );
}
