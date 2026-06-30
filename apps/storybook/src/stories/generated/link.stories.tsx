import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "@lindaui/ui/link";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  args: { href: "#", children: "Un enlace" },
};
export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {};
