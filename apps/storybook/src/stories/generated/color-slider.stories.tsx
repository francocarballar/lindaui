import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/color-slider";

const meta: Meta = { title: "Components/ColorSlider" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ColorSlider aria-label="Tono" channel="hue" colorSpace="hsl" defaultValue="#7c3aed"><M.ColorSlider.Track><M.ColorSlider.Thumb /></M.ColorSlider.Track><M.ColorSlider.Output /></M.ColorSlider>) };
