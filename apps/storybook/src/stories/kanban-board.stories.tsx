import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Clock, Flag } from "lucide-react";
import { Avatar, Chip } from "@lindaui/ui/compound";
import { EntityCard } from "@lindaui/blocks/entity-card";
import { KanbanBoard } from "@lindaui/blocks/kanban-board";

type Stage = "planned" | "active" | "review" | "complete";
interface Project { id: string; stage: Stage; name: string; owner: string; initials: string; priority?: boolean }
const columns: { id: Stage; title: string; colorClassName: string }[] = [
  { id: "planned", title: "Planned", colorClassName: "bg-violet-500/60" },
  { id: "active", title: "In progress", colorClassName: "bg-orange-500/60" },
  { id: "review", title: "Review", colorClassName: "bg-cyan-500/60" },
  { id: "complete", title: "Complete", colorClassName: "bg-green-500/60" },
];
const initial: Project[] = [
  { id: "project-a", stage: "planned", name: "Research interviews", owner: "Maya Chen", initials: "MC" },
  { id: "project-b", stage: "active", name: "Keyboard navigation", owner: "Alex Rivera", initials: "AR", priority: true },
  { id: "project-c", stage: "active", name: "Component documentation", owner: "Robin Park", initials: "RP" },
  { id: "project-d", stage: "review", name: "Release checklist", owner: "Sam Taylor", initials: "ST" },
];

const meta: Meta<typeof KanbanBoard> = {
  title: "Blocks/KanbanBoard",
  component: KanbanBoard,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof KanbanBoard>;

function ProjectBoard({ empty = false, loading = false, mobile = false }) {
  const [projects, setProjects] = useState<Project[]>(empty ? [] : initial);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className={mobile ? "w-[390px] max-w-full" : "w-full"}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
        <h2 className="text-lg font-semibold">Workspace projects</h2>
        <p className="text-sm text-muted">{selected ? `Selected: ${selected}` : "Drag a card or use ← → / Home / End"}</p>
      </div>
      <div className="h-[640px] bg-background">
        <KanbanBoard
          entities={projects} columns={columns} isLoading={loading}
          getEntityId={(project) => project.id} getColumnId={(project) => project.stage}
          onColumnChange={(id, stage) => setProjects((items) => items.map((item) => item.id === id ? { ...item, stage } : item))}
          emptyContent="No projects"
          renderCard={(project, state) => (
            <EntityCard
              id={project.id} entity={project} isDragging={state.isDragging}
              title={project.name} subtitle={project.owner}
              avatar={<Avatar size="sm"><Avatar.Fallback>{project.initials}</Avatar.Fallback></Avatar>}
              badges={<Chip size="sm" variant="soft" color={project.priority ? "danger" : "accent"}>
                {project.priority && <Flag size={12} />}{project.priority ? "Priority" : "Project"}
              </Chip>}
              time={<><Clock size={10} />2h ago</>}
              cardClassName={project.priority ? "border-l-3 border-l-danger" : undefined}
              onActivate={(item) => setSelected(item.name)}
            />
          )}
        />
      </div>
    </div>
  );
}

export const Interactive: Story = { render: () => <ProjectBoard /> };
export const Mobile: Story = { render: () => <ProjectBoard mobile /> };
export const Empty: Story = { render: () => <ProjectBoard empty /> };
export const Loading: Story = { render: () => <ProjectBoard loading /> };
