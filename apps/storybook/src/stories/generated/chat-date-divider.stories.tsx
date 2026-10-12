import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/chat-date-divider";

const meta: Meta = { title: "Components/ChatDateDivider" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ChatDateDivider date="2026-10-12T12:00:00Z" />) };
