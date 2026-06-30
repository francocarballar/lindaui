import type { Meta, StoryObj } from "@storybook/react";
import { ComboBox } from "@lindaui/ui/combobox";

const meta: Meta<typeof ComboBox> = {
  title: "Components/ComboBox",
  component: ComboBox,
  args: { label: "País", placeholder: "Elegí…", items: [{ value: "ar", label: "Argentina" }, { value: "uy", label: "Uruguay" }, { value: "cl", label: "Chile" }] },
};
export default meta;
type Story = StoryObj<typeof ComboBox>;

export const Default: Story = {};
