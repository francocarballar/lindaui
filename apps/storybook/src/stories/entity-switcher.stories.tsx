import type { Meta, StoryObj } from "@storybook/react-vite";
import { EntitySwitcher } from "@lindaui/blocks/entity-switcher";
import { LogOut, Plus } from "lucide-react";
import { useState } from "react";

const entities = [
  { identifier: "north", name: "North studio", description: "12 North Street" },
  { identifier: "south", name: "South studio", description: "34 South Street" },
  { identifier: "long", name: "Downtown creative studio and workshop", description: "A long address that stays inside the sidebar" },
];

const meta: Meta<typeof EntitySwitcher> = {
  title: "Blocks/EntitySwitcher",
  component: EntitySwitcher,
  parameters: { layout: "centered" },
  args: {
    entities,
    currentEntity: entities[0],
    labels: { trigger: "Choose studio", menu: "Choose studio", section: "My studios", fallbackDescription: "No address", visiting: "Visiting" },
  },
};
export default meta;
type Story = StoryObj<typeof EntitySwitcher>;

function SwitcherDemo({ collapsed = false, visiting = false, longName = false }) {
  const [available, setAvailable] = useState(entities);
  const [current, setCurrent] = useState(entities[longName ? 2 : 0]!);
  const [isVisiting, setIsVisiting] = useState(visiting);
  const [action, setAction] = useState("Choose another studio with the menu or keyboard.");
  return (
    <div className="space-y-4">
      <div className={`${collapsed ? "w-16" : "w-48"} rounded-lg border border-border bg-background`}>
        <EntitySwitcher
          currentEntity={current} entities={available} isCollapsed={collapsed} isVisiting={isVisiting}
          labels={{ trigger: `Choose studio: ${current.name}`, menu: "Choose studio", section: "My studios", fallbackDescription: "No address", visiting: "Visiting" }}
          onSelect={(entity) => { setCurrent(entity); setAction(`Selected ${entity.name}`); }}
          actions={isVisiting ? [{
            identifier: "exit", label: "Return to account", icon: <LogOut size={16} />, className: "text-warning",
            onAction: () => { setIsVisiting(false); setAction("Returned to your account"); },
          }] : [{
            identifier: "add", label: "New studio", icon: <Plus size={16} />, className: "text-accent",
            onAction: () => {
              const entity = { identifier: `new-${available.length}`, name: `Studio ${available.length + 1}`, description: "New workspace" };
              setAvailable([...available, entity]);
              setCurrent(entity);
              setAction(`Created ${entity.name}`);
            },
          }]}
        />
      </div>
      <p aria-live="polite" className="max-w-xs text-muted text-sm">{action}</p>
    </div>
  );
}

export const Expanded: Story = { render: () => <SwitcherDemo /> };
export const Collapsed: Story = { render: () => <SwitcherDemo collapsed /> };
export const Visiting: Story = { render: () => <SwitcherDemo visiting /> };
export const LongNames: Story = { render: () => <SwitcherDemo longName /> };
