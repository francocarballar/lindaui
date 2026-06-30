import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@lindaui/ui/textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  args: { label: "Notas", placeholder: "Escribí algo…" },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
