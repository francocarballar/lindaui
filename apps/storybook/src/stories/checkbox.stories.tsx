import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@lindaui/ui/checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Forms/Checkbox",
  component: Checkbox,
  args: { children: "Acepto los términos" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
  },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox variant="primary" defaultSelected>
        Primary
      </Checkbox>
      <Checkbox variant="secondary" defaultSelected>
        Secondary
      </Checkbox>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox>Sin marcar</Checkbox>
      <Checkbox defaultSelected>Marcado</Checkbox>
      <Checkbox isIndeterminate>Indeterminado</Checkbox>
      <Checkbox isDisabled>Deshabilitado</Checkbox>
      <Checkbox defaultSelected isDisabled>
        Marcado + deshabilitado
      </Checkbox>
    </div>
  ),
};
