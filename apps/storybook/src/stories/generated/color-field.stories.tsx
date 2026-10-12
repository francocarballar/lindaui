import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/color-field";

const meta: Meta = { title: "Components/ColorField" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ColorField aria-label="Color" defaultValue="#7c3aed"><M.ColorField.Group><M.ColorField.Input /></M.ColorField.Group></M.ColorField>) };
