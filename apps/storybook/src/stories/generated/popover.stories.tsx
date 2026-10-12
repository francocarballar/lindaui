import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/popover";

const meta: Meta = { title: "Components/Popover" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.Popover><M.Popover.Trigger tabIndex={0}>Ver detalles</M.Popover.Trigger><M.Popover.Content><M.Popover.Dialog><M.Popover.Heading>Información del turno</M.Popover.Heading><p>Traé tu documento de identidad.</p></M.Popover.Dialog></M.Popover.Content></M.Popover>) };
