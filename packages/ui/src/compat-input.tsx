"use client";

import { Description, FieldError, Input as HeroInput, InputGroup, Label, TextField } from "./compound";
import { Search, X } from "lucide-react";
import { useCallback, type ReactNode } from "react";

export type InputVariant = "flat" | "bordered" | "faded" | "underlined";
export type InputSize = "sm" | "md" | "lg";
const VARIANT_MAP: Record<InputVariant, "primary" | "secondary"> = { bordered: "primary", faded: "secondary", flat: "secondary", underlined: "secondary" };
const SIZE_MAP: Record<InputSize, string> = { lg: "h-12 text-lg", md: "h-10 text-base", sm: "h-8 text-sm" };

export interface InputProps {
  className?: string;
  defaultValue?: string;
  description?: string;
  endContent?: ReactNode;
  errorMessage?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  label?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: InputSize;
  startContent?: ReactNode;
  type?: string;
  value?: string;
  variant?: InputVariant;
}

export function Input({ label, placeholder, value, defaultValue, onValueChange, variant = "bordered", type = "text", startContent, endContent, errorMessage, isInvalid = false, isDisabled = false, isReadOnly = false, isRequired = false, description, className, size = "md" }: InputProps) {
  // Preserve legacy anatomy, including the affix container when props are omitted.
  const hasAffix = startContent !== null || endContent !== null;
  return (
    <TextField className={className} defaultValue={defaultValue} isDisabled={isDisabled} isInvalid={isInvalid} isReadOnly={isReadOnly} isRequired={isRequired} onChange={onValueChange} type={type} value={value} variant={VARIANT_MAP[variant]}>
      {label ? <Label>{label}</Label> : null}
      {hasAffix ? <InputGroup>
        {startContent ? <InputGroup.Prefix>{startContent}</InputGroup.Prefix> : null}
        <InputGroup.Input className={SIZE_MAP[size]} placeholder={placeholder} />
        {endContent ? <InputGroup.Suffix>{endContent}</InputGroup.Suffix> : null}
      </InputGroup> : <HeroInput className={SIZE_MAP[size]} placeholder={placeholder} />}
      {description ? <Description>{description}</Description> : null}
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </TextField>
  );
}

export interface SearchInputProps {
  className?: string;
  isClearable?: boolean;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: InputSize;
  value?: string;
  variant?: InputVariant;
}

export function SearchInput({ value, onValueChange, placeholder = "Buscar...", variant = "bordered", isClearable = true, className, size = "md" }: SearchInputProps) {
  const handleClear = useCallback(() => onValueChange?.(""), [onValueChange]);
  return (
    <TextField className={className} onChange={onValueChange} type="search" value={value} variant={VARIANT_MAP[variant]}>
      <InputGroup>
        <InputGroup.Prefix><Search className="text-muted" size={16} /></InputGroup.Prefix>
        <InputGroup.Input className={SIZE_MAP[size]} placeholder={placeholder} />
        {isClearable && value ? <InputGroup.Suffix>
          <button aria-label="Limpiar busqueda" className="cursor-pointer text-muted hover:text-muted" onClick={handleClear} type="button"><X size={16} /></button>
        </InputGroup.Suffix> : null}
      </InputGroup>
    </TextField>
  );
}
