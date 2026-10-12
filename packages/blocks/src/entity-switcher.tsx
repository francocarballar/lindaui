"use client";

import { Avatar, Chip, Description, Dropdown, Header, Label, Separator } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export interface EntitySwitcherItem {
  identifier: string;
  name: string;
  description?: string | null;
}

export interface EntitySwitcherAction {
  identifier: string;
  label: string;
  icon?: ReactNode;
  className?: string;
  onAction: () => void;
}

export interface EntitySwitcherLabels {
  trigger: string;
  menu: string;
  section: string;
  fallbackDescription?: string;
  visiting?: string;
}

export interface EntitySwitcherProps<T extends EntitySwitcherItem = EntitySwitcherItem> {
  currentEntity?: T | null;
  entities: T[];
  onSelect: (entity: T) => void;
  labels: EntitySwitcherLabels;
  isCollapsed?: boolean;
  isVisiting?: boolean;
  actions?: EntitySwitcherAction[];
  renderAvatar?: (entity: T) => ReactNode;
}

/** Controlled, domain-neutral entity selector with the original compact sidebar anatomy. */
export function EntitySwitcher<T extends EntitySwitcherItem>({
  currentEntity, entities, onSelect, labels, isCollapsed = false,
  isVisiting = false, actions = [], renderAvatar,
}: EntitySwitcherProps<T>) {
  if (!currentEntity) return null;

  return (
    <div className={cn("px-2 py-2", isCollapsed ? "flex justify-center" : "")}>
      <Dropdown>
        <Dropdown.Trigger aria-label={labels.trigger} className="w-full min-w-0">
          <div className={cn(
            "flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-surface-secondary",
            isVisiting ? "ring-2 ring-warning ring-offset-1" : "",
            isCollapsed ? "justify-center" : ""
          )}>
            <Avatar className="flex-shrink-0 transition-transform" color={isVisiting ? "warning" : "default"} size="sm">
              {renderAvatar ? renderAvatar(currentEntity) : (
                <Avatar.Fallback>{currentEntity.name.charAt(0).toUpperCase()}</Avatar.Fallback>
              )}
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate font-semibold text-sm">{currentEntity.name}</p>
                    {isVisiting && labels.visiting ? (
                      <Chip className="shrink-0" color="warning" size="sm" variant="soft">{labels.visiting}</Chip>
                    ) : null}
                  </div>
                  <p className="truncate text-muted text-xs">{currentEntity.description || labels.fallbackDescription}</p>
                </div>
                <ChevronDown className="shrink-0 text-muted" size={16} />
              </>
            )}
          </div>
        </Dropdown.Trigger>
        <Dropdown.Popover className="rounded-[14px]" placement="bottom start">
          <Dropdown.Menu
            aria-label={labels.menu}
            className="w-60 [&_[data-slot=menu-item]]:rounded-lg"
            onAction={(key) => {
              const action = actions.find((item) => item.identifier === String(key));
              if (action) {
                action.onAction();
                return;
              }
              const entity = entities.find((item) => item.identifier === String(key));
              if (entity) onSelect(entity);
            }}
            selectedKeys={new Set([currentEntity.identifier])}
            selectionMode="single"
          >
            <Dropdown.Section>
              <Header>{labels.section}</Header>
              {entities.map((entity) => (
                <Dropdown.Item id={entity.identifier} key={entity.identifier} textValue={entity.name}>
                  <Dropdown.ItemIndicator />
                  <Avatar className="flex-shrink-0" size="sm">
                    {renderAvatar ? renderAvatar(entity) : (
                      <Avatar.Fallback>{entity.name.charAt(0).toUpperCase()}</Avatar.Fallback>
                    )}
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <Label>{entity.name}</Label>
                    <Description>{entity.description}</Description>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown.Section>
            {actions.length > 0 ? <Separator /> : null}
            {actions.length > 0 ? (
              <Dropdown.Section>
                {actions.map((action) => (
                  <Dropdown.Item className={action.className} id={action.identifier} key={action.identifier} textValue={action.label}>
                    {action.icon}<Label>{action.label}</Label>
                  </Dropdown.Item>
                ))}
              </Dropdown.Section>
            ) : null}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
