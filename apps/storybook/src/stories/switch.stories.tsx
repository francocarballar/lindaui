import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@ts/ui/switch";

const meta: Meta<typeof Switch> = {
  title: "Forms/Switch",
  component: Switch,
  args: { children: "Activar notificaciones" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch size="sm">Small</Switch>
      <Switch size="md">Medium</Switch>
      <Switch size="lg">Large</Switch>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch>Apagado</Switch>
      <Switch defaultSelected>Encendido</Switch>
      <Switch isDisabled>Deshabilitado</Switch>
      <Switch defaultSelected isDisabled>
        Encendido + deshabilitado
      </Switch>
    </div>
  ),
};
