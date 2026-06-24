import type { Meta, StoryObj } from "@storybook/react";
import { NumberInput } from "@ts/ui/number-input";

const meta: Meta<typeof NumberInput> = {
  title: "Components/NumberInput",
  component: NumberInput,
  args: { label: "Cantidad", defaultValue: 1 },
};
export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {};
