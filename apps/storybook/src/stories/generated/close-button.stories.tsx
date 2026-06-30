import type { Meta, StoryObj } from "@storybook/react";
import { CloseButton } from "@lindaui/ui/close-button";

const meta: Meta<typeof CloseButton> = {
  title: "Components/CloseButton",
  component: CloseButton,
  args: { "aria-label": "Cerrar" },
};
export default meta;
type Story = StoryObj<typeof CloseButton>;

export const Default: Story = {};
