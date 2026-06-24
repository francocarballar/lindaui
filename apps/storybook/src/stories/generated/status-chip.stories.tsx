import type { Meta, StoryObj } from "@storybook/react";
import { StatusChip } from "@ts/ui/status-chip";

const meta: Meta<typeof StatusChip> = {
  title: "Components/StatusChip",
  component: StatusChip,
  args: { status: "FIRMADO" },
};
export default meta;
type Story = StoryObj<typeof StatusChip>;

export const Default: Story = {};
