"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import type { ReactNode } from "react";

export interface EntityCardProps<Entity extends object> {
  id: UniqueIdentifier;
  entity: Entity;
  isDragging?: boolean;
  onActivate?: (entity: Entity) => void;
  cardClassName?: string;
  badges?: ReactNode;
  time?: ReactNode;
  avatar?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}

/** Sortable presentation only: metadata, urgency and navigation belong to the caller. */
export function EntityCard<Entity extends object>({
  id,
  entity,
  isDragging = false,
  onActivate,
  cardClassName,
  badges,
  time,
  avatar,
  title,
  subtitle,
}: EntityCardProps<Entity>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ data: entity, id });
  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isCurrentlyDragging && "scale-105 opacity-50")}
    >
      <Card
        className={cn(
          "cursor-grab border-none bg-surface transition-all hover:bg-surface-secondary active:cursor-grabbing",
          "h-full min-w-full shadow-sm hover:shadow-md",
          cardClassName,
        )}
        onClick={() => {
          if (!isCurrentlyDragging) onActivate?.(entity);
        }}
      >
        <Card.Content className="flex min-h-[96px] min-w-full flex-col justify-between p-3">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">{badges}</div>
            <div className="flex items-center gap-1 text-[10px] text-muted">{time}</div>
          </div>
          <div className="mb-2 flex items-center gap-3">
            {avatar}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-sm">{title}</p>
              <p className="truncate text-[10px] text-muted">{subtitle}</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
