import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/tooltip";
import { Button } from "@lindaui/ui/button";

const meta: Meta = { title: "Components/Tooltip" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.Tooltip delay={0}><M.Tooltip.Trigger><Button>Ayuda</Button></M.Tooltip.Trigger><M.Tooltip.Content>Información adicional</M.Tooltip.Content></M.Tooltip>) };
