import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mail, MessageCircle, Radio } from "lucide-react";
import { ChannelSettings } from "@lindaui/blocks/channel-settings";
import { Input, Label, TextField } from "@lindaui/ui/compound";

const meta: Meta<typeof ChannelSettings> = {
  title: "Blocks/ChannelSettings",
  component: ChannelSettings,
  decorators: [(Story) => <div className="mx-auto max-w-xl p-4"><Story /></div>],
  args: { navigationLabel: "Canales de comunicación" },
};
export default meta;
type Story = StoryObj<typeof ChannelSettings>;

const channels = [
  {
    id: "messages",
    label: "Mensajes",
    status: "Conectado",
    icon: <MessageCircle aria-hidden="true" className="size-5 shrink-0 text-success" />,
    panel: <TextField><Label>Nombre del dispositivo</Label><Input defaultValue="Recepción" /></TextField>,
  },
  {
    id: "email",
    label: "Correo",
    status: "Desconectado",
    icon: <Mail aria-hidden="true" className="size-5 shrink-0 text-muted" />,
    panel: (active: boolean) => <div className="space-y-3"><TextField><Label>Dirección de correo</Label><Input placeholder="equipo@example.com" /></TextField><p className="text-muted text-xs">{active ? "Panel activo" : "Panel pausado"}</p></div>,
  },
];

export const PreserveForms: Story = { args: { channels, defaultSelected: "messages" } };
export const AnyChannelCount: Story = {
  args: { channels: [...channels, { id: "broadcast", label: "Difusión", status: "No disponible", isDisabled: true, icon: <Radio aria-hidden="true" className="size-5 shrink-0 text-muted" />, panel: "Configuración de difusión" }] },
};
