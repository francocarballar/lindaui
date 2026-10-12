import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/conversation-list-item";
import { useState } from "react";
function ConversationItemDemo() { const [selected, setSelected] = useState(false); return <M.ConversationListItem conversation={{id: "ada", title: "Ada Lovelace", subtitle: "¿Confirmamos el turno?", unreadCount: 2, lastMessageAt: "2026-10-12T12:00:00Z"}} selected={selected} onSelect={() => setSelected(!selected)} />; }

const meta: Meta = { title: "Components/ConversationListItem" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<ConversationItemDemo />) };
