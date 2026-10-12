import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandPalette } from "@lindaui/blocks/command-palette";
import type { CommandPaletteItem } from "@lindaui/blocks/command-palette";
import { Button } from "@lindaui/ui/compound";
import { useEffect, useState } from "react";

const items: CommandPaletteItem[] = [
  { identifier: "north", name: "North studio", description: "12 North Street · Design" },
  { identifier: "south", name: "South studio", description: "34 South Street · Production" },
  { identifier: "downtown", name: "Downtown office", description: "8 Main Avenue · Operations" },
  { identifier: "remote", name: "Remote workspace", description: "Distributed team" },
];

const meta: Meta<typeof CommandPalette> = {
  title: "Blocks/CommandPalette",
  component: CommandPalette,
  args: { items, title: "Find a workspace", placeholder: "Search names or addresses…" },
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof CommandPalette>;

function PaletteDemo({ withRecents = true, empty = false, initiallyOpen = false }) {
  const [isOpen, setOpen] = useState(initiallyOpen);
  const [recentIds, setRecents] = useState(withRecents ? ["south", "remote"] : []);
  const [selected, setSelected] = useState<CommandPaletteItem | null>(null);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-3">
      <Button onPress={() => setOpen(true)}>Find a workspace · Ctrl/Cmd+K</Button>
      <p aria-live="polite" className="text-muted text-sm">{selected ? `Opened ${selected.name}` : "Search names and descriptions, then select with Enter."}</p>
      <CommandPalette
        isOpen={isOpen} items={empty ? [] : items} recentIds={recentIds}
        title="Find a workspace" placeholder="Search names or addresses…"
        recentLabel="Recently visited" allItemsLabel="All workspaces"
        onClose={() => setOpen(false)}
        onSelect={(item) => {
          setSelected(item);
          setRecents([item.identifier, ...recentIds.filter((id) => id !== item.identifier)].slice(0, 3));
          setOpen(false);
        }}
        renderEmptyState={(query) => (
          <p className="py-6 text-center text-muted text-sm">{query ? `No workspace matches “${query}”` : "No workspaces available"}</p>
        )}
      />
    </div>
  );
}

export const SearchAndRecents: Story = { render: () => <PaletteDemo /> };
export const Open: Story = { render: () => <PaletteDemo initiallyOpen /> };
export const WithoutRecents: Story = { render: () => <PaletteDemo withRecents={false} /> };
export const Empty: Story = { render: () => <PaletteDemo empty initiallyOpen /> };
