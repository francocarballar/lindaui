import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/legacy-kpi-card";
import { Users } from "lucide-react";

const meta: Meta = { title: "Components/LegacyKpiCard" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<div style={{ width: 280 }}><M.KPICard title="Contactos activos" value={128} icon={Users} color="primary" trend={{ value: 12, isPositive: true }} /></div>) };
