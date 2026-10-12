import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/entity-health-card";

const meta: Meta = { title: "Components/EntityHealthCard" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.EntityHealthCard title="Salud del sistema" description="Estado de las integraciones" items={[{id: "messages", label: "Mensajes", value: 128, status: "success", statusLabel: "Operativo"}, {id: "queue", label: "Cola pendiente", value: 3, status: "warning", statusLabel: "Pendiente"}]} />) };
