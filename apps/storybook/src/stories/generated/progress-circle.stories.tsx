import type { Meta, StoryObj } from "@storybook/react";
import { ProgressCircle } from "@ts/ui/progress-circle";

const meta: Meta<typeof ProgressCircle> = {
  title: "Components/ProgressCircle",
  component: ProgressCircle,
  args: { value: 60, "aria-label": "Progreso" },
};
export default meta;
type Story = StoryObj<typeof ProgressCircle>;

export const Default: Story = {};
