import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { KanbanColumn } from "./kanban-column";

describe("KanbanColumn", () => {
  test("shows the supplied empty state, count and column color without additional wrappers", () => {
    const { container } = render(<DndContext><KanbanColumn
      id="review" title="Review" entities={[]} getEntityId={(entity: { id: string }) => entity.id}
      renderCard={() => null} colorClassName="bg-orange-500/60" emptyContent="Nothing to review"
    /></DndContext>);
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Nothing to review")).toHaveClass("h-32", "text-muted");
    expect(container.firstElementChild).toHaveClass("w-80", "flex-shrink-0");
    expect(container.querySelector(".h-2\\.5")).toHaveClass("bg-orange-500/60");
  });

  test("renders every entity in order and removes the empty state", () => {
    render(<DndContext><KanbanColumn
      id="review" title="Review" entities={[{ id: "b" }, { id: "a" }]}
      getEntityId={(entity) => entity.id} renderCard={(entity) => <p>{entity.id}</p>}
    /></DndContext>);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText("No items")).not.toBeInTheDocument();
    expect(screen.getByText("b").nextElementSibling).toBe(screen.getByText("a"));
  });
});
