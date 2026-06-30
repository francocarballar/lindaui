import type { Meta, StoryObj } from "@storybook/react";
import { ToggleButton } from "@lindaui/ui/toggle-button";

const meta: Meta<typeof ToggleButton> = {
  title: "Components/ToggleButton",
  component: ToggleButton,
  args: { children: "Toggle" },
};
export default meta;
type Story = StoryObj<typeof ToggleButton>;

export const Default: Story = {};
