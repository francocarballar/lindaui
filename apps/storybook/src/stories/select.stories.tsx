import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "@lindaui/ui/select";

const items = [
  { value: "rmn", label: "RMN Rodilla" },
  { value: "tac", label: "TAC Cerebro" },
  { value: "eco", label: "ECO Abdominal" },
];

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
  args: { label: "Tipo de estudio", placeholder: "Elegí…", items },
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const Preseleccionado: Story = { args: { defaultValue: "tac" } };

export const Disabled: Story = { args: { isDisabled: true } };

export const Invalid: Story = { args: { isInvalid: true } };
