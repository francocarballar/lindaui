"use client";
import {
  SearchField as HeroSearchField,
  Label,
  Input as HeroInput,
  type SearchFieldProps,
} from "@heroui/react";
import type { ReactNode } from "react";

export interface SearchProps extends Omit<SearchFieldProps, "children"> {
  label?: ReactNode;
  placeholder?: string;
}

export function SearchField({ label, placeholder, ...props }: SearchProps) {
  return (
    <HeroSearchField {...props}>
      {label != null && <Label>{label}</Label>}
      <HeroInput placeholder={placeholder} />
    </HeroSearchField>
  );
}
