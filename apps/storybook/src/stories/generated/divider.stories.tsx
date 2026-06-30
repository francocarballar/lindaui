import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/divider";

const meta: Meta = { title: "Components/Divider" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<div style={{ width: 220 }}><M.Divider /></div>) };
