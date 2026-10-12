import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/chat-avatar";

const meta: Meta = { title: "Components/ChatAvatar" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<div className="flex items-center gap-3"><M.ChatAvatar name="Ada Lovelace" size="sm" /><M.ChatAvatar name="Grace Hopper" /><M.ChatAvatar name="Alan Turing" size="lg" /></div>) };
