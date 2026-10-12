import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/chat-layout";
import { useState } from "react";
import { Button } from "@lindaui/ui/button";
function ChatLayoutDemo() { const [panel, setPanel] = useState<"sidebar" | "main" | "detail">("sidebar"); return <div className="h-80"><div className="flex gap-2">{(["sidebar", "main", "detail"] as const).map(value => <Button key={value} onPress={() => setPanel(value)}>{value}</Button>)}</div><M.ChatLayout activePanel={panel} sidebar={<p className="p-4">Conversaciones</p>} main={<p className="p-4">Mensajes</p>} detail={<p className="p-4">Detalles del contacto</p>} /></div>; }

const meta: Meta = { title: "Components/ChatLayout" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<ChatLayoutDemo />) };
