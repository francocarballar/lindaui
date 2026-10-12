import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { EntityCard } from "./entity-card";

const entity = { id: "project-42", name: "Accessibility review" };

describe("EntityCard", () => {
  test("renders metadata slots with the original compact DOM and activates the supplied entity", async () => {
    const onActivate = vi.fn();
    const { container } = render(<DndContext sensors={[]}><EntityCard
      id={entity.id} entity={entity} title={entity.name} subtitle="Design systems"
      avatar={<span>AR</span>} badges={<span>Priority</span>} time={<span>2h</span>}
      cardClassName="border-l-3 border-l-danger" onActivate={onActivate}
    /></DndContext>);
    expect(container.firstElementChild).toHaveClass("touch-none");
    expect(screen.getByText("Priority").parentElement).toHaveClass("flex-1", "flex-wrap", "gap-1");
    expect(screen.getByText("2h").parentElement).toHaveClass("text-[10px]", "text-muted");
    expect(screen.getByText(entity.name)).toHaveClass("truncate", "font-semibold", "text-sm");
    expect(screen.getByText("Design systems")).toHaveClass("truncate", "text-[10px]");
    await userEvent.click(screen.getByText(entity.name));
    expect(onActivate).toHaveBeenCalledWith(entity);
  });

  test("suppresses activation and preserves drag appearance in the overlay", async () => {
    const onActivate = vi.fn();
    const { container } = render(<DndContext sensors={[]}><EntityCard id={entity.id} entity={entity} title={entity.name} isDragging onActivate={onActivate} /></DndContext>);
    expect(container.firstElementChild).toHaveClass("touch-none", "scale-105", "opacity-50");
    await userEvent.click(screen.getByText(entity.name));
    expect(onActivate).not.toHaveBeenCalled();
  });
});
