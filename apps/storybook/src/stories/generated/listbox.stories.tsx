import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/listbox";

const meta: Meta = { title: "Components/Listbox" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ListBox aria-label="Frutas" selectionMode="single"><M.ListBoxItem id="a">Manzana</M.ListBoxItem><M.ListBoxItem id="b">Banana</M.ListBoxItem></M.ListBox>) };
