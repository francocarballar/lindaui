import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@lindaui/ui/avatar";

const meta: Meta<typeof Avatar> = {
  title: "Media/Avatar",
  component: Avatar,
  args: { children: "GR" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    color: {
      control: "select",
      options: ["default", "accent", "success", "warning", "danger"],
    },
    variant: { control: "inline-radio", options: ["default", "soft"] },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar size="sm">SM</Avatar>
      <Avatar size="md">MD</Avatar>
      <Avatar size="lg">LG</Avatar>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar color="default">DF</Avatar>
      <Avatar color="accent">AC</Avatar>
      <Avatar color="success">OK</Avatar>
      <Avatar color="warning">WN</Avatar>
      <Avatar color="danger">DG</Avatar>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar variant="default" color="accent">DF</Avatar>
      <Avatar variant="soft" color="accent">SF</Avatar>
    </div>
  ),
};

export const WithImage: Story = {
  args: {
    src: "https://i.pravatar.cc/100?img=12",
    alt: "Foto de perfil",
    children: undefined,
  },
};
