import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/status-filters";
import { useState } from "react";
function StatusFilterDemo() { const [selected, setSelected] = useState(["active"]); return <M.StatusFilters availableStatuses={["new", "active", "complete"]} selectedStatuses={selected} onStatusToggle={(status) => setSelected((current) => current.includes(status) ? current.filter((value) => value !== status) : [...current, status])} labels={{ new: "Nuevos", active: "Activos", complete: "Completados" }} colors={{ new: "primary", active: "warning", complete: "success" }} counts={{ new: 4, active: 8, complete: 2 }} />; }

const meta: Meta = { title: "Components/StatusFilters" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<StatusFilterDemo />) };
