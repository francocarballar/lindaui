import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/switch-group";
import { Switch } from "@lindaui/ui/switch";

const meta: Meta = { title: "Components/SwitchGroup" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.SwitchGroup aria-label="Notificaciones"><Switch defaultSelected>Correo electrónico</Switch><Switch>Mensajes de texto</Switch></M.SwitchGroup>) };
