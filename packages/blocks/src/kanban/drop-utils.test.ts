import { describe, expect, test } from "vitest";
import { resolveKanbanDrop } from "./drop-utils";

const entities = [{ id: "a", stage: "todo" }, { id: "b", stage: "done" }];
const input = {
  activeId: "a",
  entities,
  columns: [{ id: "todo" }, { id: "done" }],
  getEntityId: (entity: typeof entities[number]) => entity.id,
  getColumnId: (entity: typeof entities[number]) => entity.stage,
};

describe("resolveKanbanDrop", () => {
  test("resolves both a column and a card to the target column", () => {
    const expected = { entity: entities[0], entityId: "a", columnId: "done" };
    expect(resolveKanbanDrop({ ...input, overId: "done" })).toEqual(expected);
    expect(resolveKanbanDrop({ ...input, overId: "b" })).toEqual(expected);
    expect(entities[0].stage).toBe("todo");
  });

  test.each([null, "todo", "a", "unknown"])("ignores cancelled, unchanged and unknown targets: %s", (overId) => {
    expect(resolveKanbanDrop({ ...input, overId })).toBeNull();
  });

  test("ignores an active ID that no longer exists and cards outside configured columns", () => {
    expect(resolveKanbanDrop({ ...input, activeId: "gone", overId: "done" })).toBeNull();
    expect(resolveKanbanDrop({ ...input, columns: [{ id: "todo" }], overId: "b" })).toBeNull();
  });

  test("supports numeric stable IDs, including column ID zero", () => {
    expect(resolveKanbanDrop({
      activeId: 10,
      overId: 0,
      entities: [{ id: 10, stage: 1 }],
      columns: [{ id: 0 }, { id: 1 }],
      getEntityId: (entity) => entity.id,
      getColumnId: (entity) => entity.stage,
    })).toMatchObject({ entityId: 10, columnId: 0 });
  });
});
