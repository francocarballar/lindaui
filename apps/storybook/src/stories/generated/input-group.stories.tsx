import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/input-group";
import { InputGroup as Parts } from "@lindaui/ui/compound";

const meta: Meta = { title: "Components/InputGroup" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.InputGroup><Parts.Prefix>$</Parts.Prefix><Parts.Input aria-label="Importe" placeholder="0.00" /><Parts.Suffix>USD</Parts.Suffix></M.InputGroup>) };
