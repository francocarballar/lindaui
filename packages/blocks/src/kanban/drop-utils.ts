import type { UniqueIdentifier } from "@dnd-kit/core";

export interface KanbanDropInput<Entity, ColumnId extends UniqueIdentifier> {
  activeId: UniqueIdentifier;
  overId: UniqueIdentifier | null;
  entities: readonly Entity[];
  columns: readonly { id: ColumnId }[];
  getEntityId: (entity: Entity) => UniqueIdentifier;
  getColumnId: (entity: Entity) => ColumnId;
}

/** Resolve column and card targets without mutating the controlled collection. */
export function resolveKanbanDrop<Entity, ColumnId extends UniqueIdentifier>({
  activeId,
  overId,
  entities,
  columns,
  getEntityId,
  getColumnId,
}: KanbanDropInput<Entity, ColumnId>) {
  if (overId === null) return null;
  const entity = entities.find((item) => getEntityId(item) === activeId);
  if (entity === undefined) return null;

  const targetEntity = entities.find((item) => getEntityId(item) === overId);
  const targetColumn = columns.find((column) => column.id === overId);
  const columnId = targetEntity !== undefined ? getColumnId(targetEntity) : targetColumn?.id;
  if (columnId === undefined || columnId === getColumnId(entity)) return null;
  if (!columns.some((column) => column.id === columnId)) return null;
  return { entity, entityId: activeId, columnId };
}
