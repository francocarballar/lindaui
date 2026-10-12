import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/drawer";

const meta: Meta = { title: "Components/Drawer" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.Drawer><M.Drawer.Trigger>Abrir panel</M.Drawer.Trigger><M.Drawer.Backdrop><M.Drawer.Content><M.Drawer.Dialog><M.Drawer.Header><M.Drawer.Heading>Detalle del turno</M.Drawer.Heading></M.Drawer.Header><M.Drawer.Body>Turno confirmado para mañana.</M.Drawer.Body><M.Drawer.Footer><M.Drawer.CloseTrigger aria-label="Cerrar panel">Cerrar panel</M.Drawer.CloseTrigger></M.Drawer.Footer></M.Drawer.Dialog></M.Drawer.Content></M.Drawer.Backdrop></M.Drawer>) };
