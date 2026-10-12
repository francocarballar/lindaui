import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/empty-chat-view";

const meta: Meta = { title: "Components/EmptyChatView" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<div className="h-80"><M.EmptyChatView title="Elegí una conversación" description="Los mensajes de la conversación seleccionada aparecerán aquí." /></div>) };
