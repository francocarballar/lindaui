import type { Meta, StoryObj } from "@storybook/react";
import { Kbd } from "@ts/ui/kbd";

const meta: Meta<typeof Kbd> = {
  title: "Components/Kbd",
  component: Kbd,
  args: { children: "Ctrl" },
};
export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {};
