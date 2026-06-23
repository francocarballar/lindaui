"use client";
import {
  ComboBox as HeroComboBox,
  ComboBoxInputGroup,
  ComboBoxTrigger,
  ComboBoxPopover,
  Label,
  Input as HeroInput,
  ListBox,
  ListBoxItem,
} from "@heroui/react";
import type { ReactNode } from "react";

export interface ComboBoxOption {
  value: string;
  label: string;
}

export interface ComboBoxProps {
  items: ComboBoxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onInputChange?: (value: string) => void;
  label?: ReactNode;
  placeholder?: string;
  isDisabled?: boolean;
}

export function ComboBox({
  items,
  value,
  defaultValue,
  onChange,
  onInputChange,
  label,
  placeholder,
  isDisabled,
}: ComboBoxProps) {
  const controlled = value !== undefined ? { selectedKey: value } : {};

  return (
    <HeroComboBox
      {...controlled}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => {
        if (key != null) onChange?.(String(key));
      }}
      onInputChange={onInputChange}
      isDisabled={isDisabled}
    >
      {label != null && <Label>{label}</Label>}
      <ComboBoxInputGroup>
        <HeroInput placeholder={placeholder} />
        <ComboBoxTrigger />
      </ComboBoxInputGroup>
      <ComboBoxPopover>
        <ListBox items={items}>
          {(item: ComboBoxOption) => (
            <ListBoxItem id={item.value} textValue={item.label}>
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </ComboBoxPopover>
    </HeroComboBox>
  );
}
