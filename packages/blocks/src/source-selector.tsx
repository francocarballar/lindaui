"use client";

import { Button, Dropdown, Label, Spinner } from "@lindaui/ui/compound";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export interface SourceSelectorOption<Source extends string = string> {
  key: Source;
  label: string;
  triggerLabel?: string;
  icon?: ReactNode;
  triggerIcon?: ReactNode;
}

export interface SourceSelectorProps<Source extends string = string> {
  source: Source;
  options: readonly SourceSelectorOption<Source>[];
  onSourceChange: (source: Source) => void;
  isLoading?: boolean;
  ariaLabel?: string;
}

/** Controlled selection; option labels and icons are supplied by the product. */
export function SourceSelector<Source extends string = string>({
  source,
  options,
  onSourceChange,
  isLoading,
  ariaLabel = "Change source",
}: SourceSelectorProps<Source>) {
  const current = options.find((option) => option.key === source);

  return (
    <Dropdown>
      <Button
        className="h-6 min-w-0 gap-1 px-2 text-[10px]"
        isPending={isLoading}
        size="sm"
        variant="tertiary"
      >
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : current?.triggerIcon ?? current?.icon}
            {current?.triggerLabel ?? current?.label ?? source}
            <ChevronDown size={12} />
          </>
        )}
      </Button>
      <Dropdown.Popover className="rounded-[14px]">
        <Dropdown.Menu
          aria-label={ariaLabel}
          className="[&_[data-slot=menu-item]]:rounded-lg"
          onAction={(key) => {
            const option = options.find((item) => item.key === key);
            if (option) onSourceChange(option.key);
          }}
          selectedKeys={[source]}
          selectionMode="single"
        >
          {options.map((option) => (
            <Dropdown.Item className="text-sm" id={option.key} key={option.key} textValue={option.label}>
              <Dropdown.ItemIndicator />
              {option.icon}
              <Label>{option.label}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
