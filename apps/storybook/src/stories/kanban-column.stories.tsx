import type { Meta, StoryObj } from "@storybook/react-vite";
import { DndContext } from "@dnd-kit/core";
import { KanbanColumn } from "@lindaui/blocks/kanban-column";
import { EntityCard } from "@lindaui/blocks/entity-card";

const meta: Meta<typeof KanbanColumn> = { title: "Blocks/KanbanColumn", component: KanbanColumn };
export default meta;
type Story = StoryObj<typeof KanbanColumn>;
const tasks = [{ id: "task-a", title: "Document APIs" }, { id: "task-b", title: "Review keyboard behavior" }];

export const WithCards: Story = {
  render: () => <DndContext><div className="h-[600px]">
    <KanbanColumn id="review" title="Review" colorClassName="bg-cyan-500/60" entities={tasks}
      getEntityId={(task) => task.id}
      renderCard={(task) => <EntityCard id={task.id} entity={task} title={task.title} subtitle="Design systems team" />} />
  </div></DndContext>,
};
export const Empty: Story = {
  render: () => <DndContext><div className="h-[600px]">
    <KanbanColumn id="complete" title="Complete" colorClassName="bg-green-500/60" entities={[]}
      getEntityId={(task: typeof tasks[number]) => task.id} renderCard={() => null} emptyContent="Nothing completed yet" />
  </div></DndContext>,
};
