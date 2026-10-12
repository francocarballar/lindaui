import type { Meta, StoryObj } from "@storybook/react-vite";
import { DndContext } from "@dnd-kit/core";
import { useState } from "react";
import { Clock, Flag } from "lucide-react";
import { Avatar, Chip, Tooltip } from "@lindaui/ui/compound";
import { EntityCard } from "@lindaui/blocks/entity-card";

const meta: Meta<typeof EntityCard> = { title: "Blocks/EntityCard", component: EntityCard };
export default meta;
type Story = StoryObj<typeof EntityCard>;
const entity = { id: "request-42", title: "Workspace accessibility review", owner: "Alex Rivera" };

function RequestCard({ priority = false, dragging = false }) {
  const [selected, setSelected] = useState(false);
  return <DndContext sensors={[]}><div className="w-80 max-w-full space-y-4">
    <EntityCard id={entity.id} entity={entity} title={entity.title} subtitle={entity.owner} isDragging={dragging}
      cardClassName={priority ? "border-l-3 border-l-danger" : undefined}
      avatar={<Avatar size="sm"><Avatar.Fallback>AR</Avatar.Fallback></Avatar>}
      time={<><Clock size={10} />2h ago</>}
      badges={<><Chip size="sm" variant="soft">Internal</Chip>{priority && <Tooltip>
        <Tooltip.Trigger><Chip className="h-5 max-w-[80px]" color="danger" size="sm" variant="soft"><Flag size={12} /><span className="truncate text-[10px]">Priority</span></Chip></Tooltip.Trigger>
        <Tooltip.Content>Requested before the next release</Tooltip.Content>
      </Tooltip>}</>}
      onActivate={() => setSelected(true)} />
    <p className="text-sm text-muted">{selected ? "Request selected" : "Select the card to open its request"}</p>
  </div></DndContext>;
}

export const Default: Story = { render: () => <RequestCard /> };
export const Priority: Story = { render: () => <RequestCard priority /> };
export const Dragging: Story = { render: () => <RequestCard priority dragging /> };
