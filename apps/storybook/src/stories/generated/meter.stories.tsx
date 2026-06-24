import type { Meta, StoryObj } from "@storybook/react";
import { Meter } from "@ts/ui/meter";

const meta: Meta<typeof Meter> = {
  title: "Components/Meter",
  component: Meter,
  args: { value: 40, "aria-label": "Uso de disco" },
};
export default meta;
type Story = StoryObj<typeof Meter>;

export const Default: Story = {};
