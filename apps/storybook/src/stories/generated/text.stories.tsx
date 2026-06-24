import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "@ts/ui/text";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  args: { children: "Texto de ejemplo" },
};
export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {};
