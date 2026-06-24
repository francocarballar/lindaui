import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@ts/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "Status/Badge",
  component: Badge,
  args: { children: "Nuevo", variant: "default" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "danger", "info"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};
