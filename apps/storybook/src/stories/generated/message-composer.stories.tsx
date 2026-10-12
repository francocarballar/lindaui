import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/message-composer";
import { useState } from "react";
function ComposerDemo() { const [value, setValue] = useState(""); const [sent, setSent] = useState(""); return <div className="w-full max-w-lg"><M.MessageComposer value={value} onValueChange={setValue} onSend={() => { setSent(value); setValue(""); }} /><output role="status">{sent ? `Enviado: ${sent}` : "Sin mensajes enviados"}</output></div>; }

const meta: Meta = { title: "Components/MessageComposer" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<ComposerDemo />) };
