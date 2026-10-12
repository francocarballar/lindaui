import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/color-swatch";

const meta: Meta = { title: "Components/ColorSwatch" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ColorSwatch color="#7c3aed" aria-label="Violeta" />) };
