import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "@lindaui/blocks/login-form";

const meta: Meta<typeof LoginForm> = {
  title: "Blocks/LoginForm",
  component: LoginForm,
  args: {
    onSubmit: (values) => console.log("submit", values),
  },
};
export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true } };

export const WithError: Story = {
  args: { error: "Credenciales inválidas" },
};

export const CustomLabels: Story = {
  args: { title: "Acceso médicos", submitLabel: "Entrar" },
};
