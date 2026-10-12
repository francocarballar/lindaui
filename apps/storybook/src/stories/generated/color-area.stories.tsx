import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/color-area";

const meta: Meta = { title: "Components/ColorArea" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ColorArea aria-label="Saturación y brillo" defaultValue="#7c3aed" colorSpace="hsb" xChannel="saturation" yChannel="brightness"><M.ColorArea.Thumb /></M.ColorArea>) };
