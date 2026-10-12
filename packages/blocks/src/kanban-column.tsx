"use client";

import { useDroppable, type UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@lindaui/ui/cn";
import { Fragment, type ReactNode } from "react";

export interface KanbanColumnProps<Entity> {
  id: UniqueIdentifier;
  title: ReactNode;
  entities: readonly Entity[];
  getEntityId: (entity: Entity) => UniqueIdentifier;
  renderCard: (entity: Entity) => ReactNode;
  colorClassName?: string;
  emptyContent?: ReactNode;
}

export function KanbanColumn<Entity>({
  id,
  title,
  entities,
  getEntityId,
  renderCard,
  colorClassName = "bg-accent/60",
  emptyContent = "No items",
}: KanbanColumnProps<Entity>) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex h-full w-80 flex-shrink-0 flex-col">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface/50">
        <div className={cn("h-2.5", colorClassName)} />
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="rounded-full bg-surface-secondary px-2 py-1 font-mono text-muted text-xs">
            {entities.length}
          </span>
        </div>
        <div
          className={cn(
            "min-h-[500px] flex-1 overflow-y-auto p-2 transition-colors",
            isOver ? "bg-accent/10" : "",
          )}
          ref={setNodeRef}
        >
          <SortableContext items={entities.map(getEntityId)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {entities.map((entity) => (
                <Fragment key={getEntityId(entity)}>{renderCard(entity)}</Fragment>
              ))}
            </div>
          </SortableContext>
          {entities.length === 0 && (
            <div className="flex h-32 items-center justify-center text-muted text-sm">
              {emptyContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
