import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chip } from "@lindaui/ui/chip";

const meta: Meta<typeof Chip> = {
  title: "Status/Chip",
  component: Chip,
  args: { children: "Etiqueta" },
  argTypes: {
    color: {
      control: "select",
      options: ["default", "accent", "success", "warning", "danger"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "soft"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Chip>;

export const Playground: Story = {};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip color="default">Default</Chip>
      <Chip color="accent">Accent</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="danger">Danger</Chip>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
      <Chip size="lg">Large</Chip>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip variant="primary" color="accent">Primary</Chip>
      <Chip variant="secondary" color="accent">Secondary</Chip>
      <Chip variant="tertiary" color="accent">Tertiary</Chip>
      <Chip variant="soft" color="accent">Soft</Chip>
    </div>
  ),
};
