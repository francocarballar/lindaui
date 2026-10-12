import type { DndContextProps, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { act, render, screen } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { KanbanBoard } from "./kanban-board";

const dnd = vi.hoisted(() => ({ props: null as DndContextProps | null }));
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...original,
    DndContext: (props: DndContextProps) => { dnd.props = props; return props.children; },
    DragOverlay: ({ children }: { children: ReactNode }) => children,
  };
});

const entities = [{ id: "task-a", stage: "todo" }, { id: "task-b", stage: "done" }];
const props = {
  entities,
  columns: [{ id: "todo", title: "To do" }, { id: "done", title: "Done" }],
  getEntityId: (entity: typeof entities[number]) => entity.id,
  getColumnId: (entity: typeof entities[number]) => entity.stage,
  renderCard: (entity: typeof entities[number], state: { isDragging: boolean }) => <p>{entity.id}{state.isDragging ? " overlay" : ""}</p>,
};
const dragEnd = (overId: string | null) => ({ active: { id: "task-a" }, over: overId ? { id: overId } : null }) as DragEndEvent;

describe("KanbanBoard controlled behavior", () => {
  beforeEach(() => { dnd.props = null; });

  test("emits a stable entity ID and target column for column and card drops without mutating data", () => {
    const onColumnChange = vi.fn();
    render(<KanbanBoard {...props} onColumnChange={onColumnChange} />);
    act(() => dnd.props?.onDragEnd?.(dragEnd("done")));
    act(() => dnd.props?.onDragEnd?.(dragEnd("task-b")));
    expect(onColumnChange).toHaveBeenCalledTimes(2);
    expect(onColumnChange).toHaveBeenCalledWith("task-a", "done", entities[0]);
    expect(entities[0].stage).toBe("todo");
    expect(screen.getByText("task-a").closest("section")).toHaveAttribute("aria-label", "Kanban board");
  });

  test("ignores unchanged and missing targets and clears the overlay when a drop ends", () => {
    const onColumnChange = vi.fn();
    render(<KanbanBoard {...props} onColumnChange={onColumnChange} />);
    act(() => dnd.props?.onDragStart?.({ active: { id: "task-a" } } as DragStartEvent));
    expect(screen.getByText("task-a overlay").parentElement).toHaveClass("rotate-3", "opacity-80");
    act(() => dnd.props?.onDragEnd?.(dragEnd(null)));
    expect(screen.queryByText("task-a overlay")).not.toBeInTheDocument();
    act(() => dnd.props?.onDragEnd?.(dragEnd("todo")));
    act(() => dnd.props?.onDragEnd?.(dragEnd(null)));
    expect(onColumnChange).not.toHaveBeenCalled();
  });

  test("retains pointer/touch activation constraints", () => {
    render(<KanbanBoard {...props} onColumnChange={vi.fn()} />);
    expect(dnd.props?.sensors?.map((sensor) => sensor.options.activationConstraint)).toEqual([
      { distance: 8 }, { delay: 200, tolerance: 5 },
    ]);
  });

  test("preserves loading column structure and the ready scroll container", () => {
    const { container, rerender } = render(<KanbanBoard {...props} onColumnChange={vi.fn()} isLoading />);
    expect(container.firstElementChild).toHaveClass("flex", "gap-4", "overflow-x-auto", "p-4", "lg:p-6");
    expect(container.firstElementChild?.children).toHaveLength(2);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    rerender(<KanbanBoard {...props} onColumnChange={vi.fn()} />);
    const section = screen.getByRole("region", { name: "Kanban board" });
    expect(section).toHaveClass("flex", "h-full", "gap-4", "overflow-x-auto", "overflow-y-visible", "p-4", "lg:p-6");
  });

  test("uses stable IDs as keys when entities reorder", () => {
    let mounts = 0;
    function StatefulCard({ id }: { id: string }) {
      const [mount] = useState(() => ++mounts);
      return <p>{id}:{mount}</p>;
    }
    const first = [{ id: "a", stage: "todo" }, { id: "b", stage: "todo" }];
    const renderCard = (entity: typeof first[number]) => <StatefulCard id={entity.id} />;
    const { rerender } = render(<KanbanBoard {...props} entities={first} renderCard={renderCard} onColumnChange={vi.fn()} />);
    const original = screen.getByText(/^a:/).textContent;
    rerender(<KanbanBoard {...props} entities={[first[1], first[0]]} renderCard={renderCard} onColumnChange={vi.fn()} />);
    expect(screen.getByText(/^a:/).textContent).toBe(original);
  });
});
