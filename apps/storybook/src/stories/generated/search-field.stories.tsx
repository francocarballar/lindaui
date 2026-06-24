import type { Meta, StoryObj } from "@storybook/react";
import { SearchField } from "@ts/ui/search-field";

const meta: Meta<typeof SearchField> = {
  title: "Components/SearchField",
  component: SearchField,
  args: { label: "Buscar", placeholder: "Buscar…" },
};
export default meta;
type Story = StoryObj<typeof SearchField>;

export const Default: Story = {};
