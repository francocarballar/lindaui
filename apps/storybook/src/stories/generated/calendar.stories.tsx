import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/calendar";
import { parseDate } from "@internationalized/date";

const meta: Meta = { title: "Components/Calendar" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.Calendar aria-label="Fecha del turno" defaultValue={parseDate("2026-10-12")}><M.Calendar.Header><M.Calendar.NavButton slot="previous" /><M.Calendar.Heading /><M.Calendar.NavButton slot="next" /></M.Calendar.Header><M.Calendar.Grid><M.Calendar.GridHeader>{day => <M.Calendar.HeaderCell>{day}</M.Calendar.HeaderCell>}</M.Calendar.GridHeader><M.Calendar.GridBody>{date => <M.Calendar.Cell date={date} />}</M.Calendar.GridBody></M.Calendar.Grid></M.Calendar>) };
