import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@ts/ui/tabs";

const meta: Meta = { title: "Components/Tabs" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.Tabs><M.TabList><M.Tab id="a">Cuenta</M.Tab><M.Tab id="b">Seguridad</M.Tab></M.TabList><M.TabPanel id="a">Panel de cuenta</M.TabPanel><M.TabPanel id="b">Panel de seguridad</M.TabPanel></M.Tabs>) };
