import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/radio";
import { RadioGroup } from "@lindaui/ui/radio-group";

const meta: Meta = { title: "Components/Radio" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<RadioGroup aria-label="Entrega" defaultValue="normal"><M.Radio value="normal">Normal</M.Radio><M.Radio value="express">Express</M.Radio></RadioGroup>) };
