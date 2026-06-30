import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/checkbox-group";
import { Checkbox } from "@lindaui/ui/checkbox";

const meta: Meta = { title: "Components/CheckboxGroup" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.CheckboxGroup aria-label="Opciones" defaultValue={["a"]}><Checkbox value="a">Opción A</Checkbox><Checkbox value="b">Opción B</Checkbox></M.CheckboxGroup>) };
