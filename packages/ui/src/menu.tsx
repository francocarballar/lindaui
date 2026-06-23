"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import type { ReactNode } from "react";

export interface MenuItem {
  key: string;
  label: ReactNode;
  onAction?: () => void;
  isDanger?: boolean;
  isDisabled?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  /** Content of the trigger button (label/icon). HeroUI's DropdownTrigger
   *  renders the button itself, so pass content here — not a `<button>`. */
  trigger: ReactNode;
}

/**
 * Action menu with a flat `items[]` + `trigger` API. Composes HeroUI v3's
 * Dropdown (Trigger > Popover > Menu > Item); item `onAction` callbacks are
 * dispatched by key via the RAC Menu `onAction`.
 */
export function Menu({ items, trigger }: MenuProps) {
  return (
    <Dropdown>
      <DropdownTrigger>{trigger}</DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu
          onAction={(key) => {
            items.find((i) => i.key === String(key))?.onAction?.();
          }}
        >
          {items.map((item) => (
            <DropdownItem
              key={item.key}
              id={item.key}
              textValue={typeof item.label === "string" ? item.label : item.key}
              isDisabled={item.isDisabled}
              className={item.isDanger ? "text-danger" : undefined}
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );
}
