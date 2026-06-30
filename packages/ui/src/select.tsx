"use client";
import {
  Select as HeroSelect,
  SelectTrigger,
  SelectValue,
  SelectPopover,
  Label,
  ListBox,
  ListBoxItem,
} from "@heroui/react";
import type { ReactNode } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Stable Select API for @lindaui/ui: `items[]` + `onChange(value)`. Internally
 * composes HeroUI v3's RAC Select (selectedKey/onSelectionChange) so the
 * react-aria composition never leaks into the public surface.
 */
export interface SelectProps {
  items: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: ReactNode;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  name?: string;
}

export function Select({
  items,
  value,
  defaultValue,
  onChange,
  label,
  placeholder,
  isDisabled,
  isInvalid,
  name,
}: SelectProps) {
  // Only pass selectedKey when controlled, to avoid the RAC
  // controlled/uncontrolled warning when callers omit `value`.
  const controlled = value !== undefined ? { selectedKey: value } : {};

  return (
    <HeroSelect
      {...controlled}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => {
        if (key != null) onChange?.(String(key));
      }}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      name={name}
    >
      {label != null && <Label>{label}</Label>}
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectPopover>
        <ListBox items={items}>
          {(item: SelectOption) => (
            <ListBoxItem id={item.value} textValue={item.label}>
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </SelectPopover>
    </HeroSelect>
  );
}
