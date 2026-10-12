import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/conversation-thread";

const meta: Meta = { title: "Components/ConversationThread" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<div className="h-80 w-full max-w-lg"><M.ConversationThread messages={[{id: "a", side: "incoming", text: "Consulta del lunes", sentAt: "2026-10-12T12:00:00Z"}, {id: "b", side: "outgoing", text: "Respuesta del martes", sentAt: "2026-10-13T12:00:00Z", status: "delivered"}]} /></div>) };
