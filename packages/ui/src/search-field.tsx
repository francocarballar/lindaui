"use client";
import {
  SearchField as HeroSearchField,
  SearchFieldGroup,
  SearchFieldSearchIcon,
  SearchFieldInput,
  SearchFieldClearButton,
  Label,
  type SearchFieldProps,
} from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Ergonomic search field. Composes the RAC compound so the magnifier icon and
 * the clear button ship by default (HeroUI leaves them opt-in). Surface styling
 * is token-driven: override the `--field-*` custom properties, not `className`
 * — `className` is intentionally rejected so a mis-targeted class fails at
 * compile time instead of silently landing on the wrong element.
 */
export interface SearchProps
  extends Omit<SearchFieldProps, "children" | "className"> {
  label?: ReactNode;
  placeholder?: string;
}

export function SearchField({ label, placeholder, ...props }: SearchProps) {
  return (
    <HeroSearchField {...props}>
      {label != null && <Label>{label}</Label>}
      <SearchFieldGroup>
        <SearchFieldSearchIcon />
        <SearchFieldInput placeholder={placeholder} />
        <SearchFieldClearButton />
      </SearchFieldGroup>
    </HeroSearchField>
  );
}
