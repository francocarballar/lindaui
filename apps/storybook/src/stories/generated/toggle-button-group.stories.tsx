import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/toggle-button-group";
import { ToggleButton } from "@lindaui/ui/toggle-button";

const meta: Meta = { title: "Components/ToggleButtonGroup" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ToggleButtonGroup aria-label="Alineación" selectionMode="single" defaultSelectedKeys={["left"]}><ToggleButton id="left">Izquierda</ToggleButton><ToggleButton id="center">Centro</ToggleButton><ToggleButton id="right">Derecha</ToggleButton></M.ToggleButtonGroup>) };
