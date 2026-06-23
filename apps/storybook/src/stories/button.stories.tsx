import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@ts/ui/button";

const meta: Meta<typeof Button> = {
  title: "Buttons/Button",
  component: Button,
  args: { children: "Guardar" },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Link: Story = { args: { variant: "link" } };
export const Disabled: Story = { args: { isDisabled: true } };
