import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/chat-header";
import { ChatAvatar } from "@lindaui/blocks/chat-avatar";

const meta: Meta = { title: "Components/ChatHeader" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ChatHeader title="Ada Lovelace" subtitle="En línea" avatar={<ChatAvatar name="Ada Lovelace" />} />) };
