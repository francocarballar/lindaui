import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@ts/ui/input";

const meta: Meta<typeof Input> = {
  title: "Forms/Input",
  component: Input,
  args: { label: "Email", placeholder: "tu@email.com" },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Password: Story = {
  args: { label: "Contraseña", type: "password", placeholder: "••••••••" },
};

export const Invalid: Story = {
  args: { label: "Email", isInvalid: true, defaultValue: "no-es-email" },
};

export const Disabled: Story = {
  args: { label: "Email", isDisabled: true, defaultValue: "fijo@correo.com" },
};
