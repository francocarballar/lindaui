"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { Skeleton } from "@lindaui/ui/compound";
import { Fragment, useRef, useState, type ReactNode } from "react";
import { KanbanColumn } from "./kanban-column";
import { resolveKanbanDrop } from "./kanban/drop-utils";
import { NavigationButtons } from "./kanban/navigation-buttons";
import { ScrollIndicators } from "./kanban/scroll-indicators";
import { useKeyboardNavigation } from "./kanban/use-keyboard-navigation";

export { resolveKanbanDrop } from "./kanban/drop-utils";
export { NavigationButtons, type NavigationButtonsProps } from "./kanban/navigation-buttons";
export { ScrollIndicators, type ScrollIndicatorsProps } from "./kanban/scroll-indicators";
export { useKeyboardNavigation } from "./kanban/use-keyboard-navigation";

export interface KanbanColumnDefinition<ColumnId extends UniqueIdentifier = string> {
  id: ColumnId;
  title: ReactNode;
  colorClassName?: string;
}

export interface KanbanCardState {
  isDragging: boolean;
}

export interface KanbanBoardProps<Entity, ColumnId extends UniqueIdentifier = string> {
  /** Entity and column IDs must be stable and unique across the whole board. */
  entities: readonly Entity[];
  columns: readonly KanbanColumnDefinition<ColumnId>[];
  getEntityId: (entity: Entity) => UniqueIdentifier;
  getColumnId: (entity: Entity) => ColumnId;
  onColumnChange: (entityId: UniqueIdentifier, columnId: ColumnId, entity: Entity) => void;
  renderCard: (entity: Entity, state: KanbanCardState) => ReactNode;
  renderColumn?: (column: KanbanColumnDefinition<ColumnId>, entities: readonly Entity[]) => ReactNode;
  isLoading?: boolean;
  emptyContent?: ReactNode;
  ariaLabel?: string;
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}

export function KanbanBoard<Entity, ColumnId extends UniqueIdentifier = string>({
  entities,
  columns,
  getEntityId,
  getColumnId,
  onColumnChange,
  renderCard,
  renderColumn,
  isLoading = false,
  emptyContent,
  ariaLabel = "Kanban board",
  scrollLeftLabel,
  scrollRightLabel,
}: KanbanBoardProps<Entity, ColumnId>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const scrollRef = useRef<HTMLElement>(null);
  useKeyboardNavigation(scrollRef);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id);
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const drop = resolveKanbanDrop({
      activeId: event.active.id,
      overId: event.over?.id ?? null,
      entities,
      columns,
      getEntityId,
      getColumnId,
    });
    if (drop) onColumnChange(drop.entityId, drop.columnId, drop.entity);
  };
  const activeEntity = activeId !== null
    ? entities.find((entity) => getEntityId(entity) === activeId)
    : null;

  if (isLoading) {
    return (
      <div className="flex h-full gap-4 overflow-x-auto p-4 lg:p-6">
        {columns.map((column) => (
          <div className="flex w-80 flex-shrink-0 flex-col gap-3" key={column.id}>
            <Skeleton className="h-8 w-24 rounded-lg" />
            <div className="min-h-[500px] space-y-3 rounded-xl bg-surface-secondary/50 p-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton className="h-32 w-full rounded-xl" key={index} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="relative h-full w-full overflow-hidden">
        <ScrollIndicators scrollRef={scrollRef} />
        <NavigationButtons
          scrollRef={scrollRef}
          leftLabel={scrollLeftLabel}
          rightLabel={scrollRightLabel}
        />
        <section
          aria-label={ariaLabel}
          className="flex h-full gap-4 overflow-x-auto overflow-y-visible p-4 lg:p-6"
          ref={scrollRef}
        >
          {columns.map((column) => {
            const items = entities.filter((entity) => getColumnId(entity) === column.id);
            return (
              <Fragment key={column.id}>
                {renderColumn ? (
                  renderColumn(column, items)
                ) : (
                  <KanbanColumn
                    id={column.id}
                    title={column.title}
                    entities={items}
                    getEntityId={getEntityId}
                    renderCard={(entity) => renderCard(entity, { isDragging: false })}
                    colorClassName={column.colorClassName}
                    emptyContent={emptyContent}
                  />
                )}
              </Fragment>
            );
          })}
        </section>
      </div>
      <DragOverlay>
        {activeEntity !== null && activeEntity !== undefined ? (
          <div className="rotate-3 opacity-80">
            {renderCard(activeEntity, { isDragging: true })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
