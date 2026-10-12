"use client";

import { Tabs } from "@lindaui/ui/compound";
import { useState, type ReactNode } from "react";

export interface SettingsChannel {
  id: string;
  label: ReactNode;
  status: ReactNode;
  icon?: ReactNode;
  isDisabled?: boolean;
  panel: ReactNode | ((isSelected: boolean) => ReactNode);
  /** Optional mounting order, independent of the tab order. */
  panelOrder?: number;
}

export interface ChannelSettingsProps {
  channels: readonly SettingsChannel[];
  navigationLabel: string;
  selected?: string;
  defaultSelected?: string;
  onSelect?: (id: string) => void;
  className?: string;
  /** Two channels retain the original two-column layout; other counts adapt automatically. */
  listClassName?: string;
}

/** Every panel stays mounted so switching channels preserves form and challenge state. */
export function ChannelSettings({
  channels,
  navigationLabel,
  selected,
  defaultSelected,
  onSelect,
  className = "w-full gap-5",
  listClassName,
}: ChannelSettingsProps) {
  const [localSelected, setLocalSelected] = useState(defaultSelected ?? channels[0]?.id);
  const current = selected ?? localSelected;

  return (
    <Tabs
      className={className}
      onSelectionChange={(key) => {
        const id = String(key);
        if (selected === undefined) setLocalSelected(id);
        onSelect?.(id);
      }}
      selectedKey={current}
      variant="secondary"
    >
      <Tabs.ListContainer className="w-full">
        <Tabs.List
          aria-label={navigationLabel}
          className={listClassName ?? (channels.length === 2 ? "grid w-full grid-cols-2" : "grid w-full auto-cols-fr grid-flow-col")}
        >
          {channels.map(({ id, label, status, icon, isDisabled }) => (
            <Tabs.Tab className="h-auto min-w-0 justify-start gap-3 px-3 py-4" id={id} isDisabled={isDisabled} key={id}>
              {icon}
              <span className="min-w-0 text-left">
                <span className="block font-semibold text-sm">{label}</span>
                <span className="block whitespace-normal font-normal text-muted text-xs">{status}</span>
              </span>
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      {[...channels].sort((a, b) => (a.panelOrder ?? 0) - (b.panelOrder ?? 0)).map(({ id, panel }) => (
        <Tabs.Panel className={current === id ? "" : "hidden"} id={id} key={id} shouldForceMount>
          {typeof panel === "function" ? panel(current === id) : panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
