import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@ts/ui/button";

const meta: Meta<typeof Button> = {
  title: "Buttons/Button",
  component: Button,
  args: { children: "Guardar", variant: "primary" },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger", "link"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

/** Editable con los controls. */
export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Normal</Button>
      <Button isDisabled>Disabled</Button>
      <Button isPending>Pending</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-72">
      <Button fullWidth>Ancho completo</Button>
    </div>
  ),
};
