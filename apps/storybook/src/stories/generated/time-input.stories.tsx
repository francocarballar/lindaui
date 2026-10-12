import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/time-input";
import { Time } from "@internationalized/date";
import { Label } from "@lindaui/ui/compound";

const meta: Meta = { title: "Components/TimeInput" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.TimeInput defaultValue={new Time(14, 30)} hourCycle={24}><Label>Hora del turno</Label><M.TimeInput.Group><M.TimeInput.Input>{segment => <M.TimeInput.Segment segment={segment} />}</M.TimeInput.Input></M.TimeInput.Group></M.TimeInput>) };
