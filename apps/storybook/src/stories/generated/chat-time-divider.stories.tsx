import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/chat-time-divider";

const meta: Meta = { title: "Components/ChatTimeDivider" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ChatTimeDivider label="Esta mañana" />) };
