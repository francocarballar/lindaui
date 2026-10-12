import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/message-bubble";

const meta: Meta = { title: "Components/MessageBubble" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<div className="w-full max-w-lg space-y-3"><M.MessageBubble message={{id: "incoming", side: "incoming", text: "¿Podemos confirmar el turno?", sentAt: "2026-10-12T12:00:00Z"}} /><M.MessageBubble message={{id: "outgoing", side: "outgoing", text: "Sí, te esperamos mañana.", sentAt: "2026-10-12T12:01:00Z", status: "read"}} /></div>) };
