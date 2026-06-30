import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/radio-group";
import { Radio } from "@lindaui/ui/radio";

const meta: Meta = { title: "Components/RadioGroup" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.RadioGroup aria-label="Plan" defaultValue="basico"><Radio value="basico">Básico</Radio><Radio value="pro">Pro</Radio></M.RadioGroup>) };
