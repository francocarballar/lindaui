import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "@lindaui/ui/icon-button";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  args: { "aria-label": "Cerrar", children: "×" },
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};
