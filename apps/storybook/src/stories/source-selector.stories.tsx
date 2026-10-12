import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Mail, MessageCircle, Globe } from "lucide-react";
import { SourceSelector } from "@lindaui/blocks/source-selector";

const meta: Meta<typeof SourceSelector> = { title: "Blocks/SourceSelector", component: SourceSelector };
export default meta;
type Story = StoryObj<typeof SourceSelector>;
type Channel = "email" | "chat" | "web";

function Channels({ pending = false, spanish = false }) {
  const [channel, setChannel] = useState<Channel>("email");
  return <div className="space-y-4">
    <SourceSelector<Channel> source={channel} onSourceChange={setChannel} isLoading={pending} ariaLabel={spanish ? "Cambiar canal" : "Change channel"}
      options={[
        { key: "email", label: spanish ? "Correo" : "Email", triggerLabel: spanish ? "CORREO" : "EMAIL", icon: <Mail size={14} />, triggerIcon: <Mail size={12} /> },
        { key: "chat", label: "Chat", triggerLabel: "CHAT", icon: <MessageCircle size={14} />, triggerIcon: <MessageCircle size={12} /> },
        { key: "web", label: "Web", triggerLabel: "WEB", icon: <Globe size={14} />, triggerIcon: <Globe size={12} /> },
      ]} />
    <p className="text-sm text-muted">{spanish ? "Canal seleccionado" : "Selected channel"}: {channel}</p>
  </div>;
}

export const Interactive: Story = { render: () => <Channels /> };
export const Pending: Story = { render: () => <Channels pending /> };
export const SpanishLabels: Story = { render: () => <Channels spanish /> };
