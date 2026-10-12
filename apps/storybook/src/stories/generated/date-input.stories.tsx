import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/date-input";
import { parseDate } from "@internationalized/date";
import { Label } from "@lindaui/ui/compound";

const meta: Meta = { title: "Components/DateInput" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.DateInput defaultValue={parseDate("2026-10-12")}><Label>Fecha del turno</Label><M.DateInput.Group><M.DateInput.Input>{segment => <M.DateInput.Segment segment={segment} />}</M.DateInput.Input></M.DateInput.Group></M.DateInput>) };
