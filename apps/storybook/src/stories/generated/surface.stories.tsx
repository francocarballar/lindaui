import type { Meta, StoryObj } from "@storybook/react";
import { Surface } from "@ts/ui/surface";

const meta: Meta<typeof Surface> = {
  title: "Components/Surface",
  component: Surface,
  args: { className: "p-4", children: "Contenido en una surface" },
};
export default meta;
type Story = StoryObj<typeof Surface>;

export const Default: Story = {};
