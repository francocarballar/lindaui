import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "@ts/ui/progress";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  args: { value: 60, "aria-label": "Progreso" },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {};
