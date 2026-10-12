import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/conversation-list";
import { useState } from "react";
function ConversationsDemo() { const [selected, setSelected] = useState("ada"); const [search, setSearch] = useState(""); const contacts = [{id: "ada", title: "Ada Lovelace", subtitle: "Turno confirmado", unreadCount: 2}, {id: "grace", title: "Grace Hopper", subtitle: "Nueva consulta"}]; return <div className="h-80 max-w-sm"><M.ConversationList conversations={contacts.filter(contact => contact.title.toLowerCase().includes(search.toLowerCase()))} selectedId={selected} onSelect={setSelected} searchValue={search} onSearchChange={setSearch} /></div>; }

const meta: Meta = { title: "Components/ConversationList" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<ConversationsDemo />) };
