import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "@lindaui/ui/slider";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  args: { "aria-label": "Volumen", defaultValue: 30 },
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {};
