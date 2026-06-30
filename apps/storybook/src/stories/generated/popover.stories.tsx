import type { Meta, StoryObj } from "@storybook/react";
import * as Mod from "@lindaui/ui/popover";

// Scaffold auto-generado. TODO: componer una story real (ver CLAUDE.md).
const exportNames = Object.keys(Mod);

function Scaffold() {
  return (
    <div style={{ padding: 16, fontFamily: "monospace", fontSize: 13 }}>
      <p><strong>popover</strong> &mdash; story pendiente.</p>
      <p>Exports: {exportNames.join(", ")}</p>
    </div>
  );
}

const meta: Meta<typeof Scaffold> = { title: "WIP/Popover", component: Scaffold };
export default meta;
type Story = StoryObj<typeof Scaffold>;

export const Default: Story = {};
