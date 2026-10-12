import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/range-calendar";
import { parseDate } from "@internationalized/date";

const meta: Meta = { title: "Components/RangeCalendar" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.RangeCalendar aria-label="Período" defaultValue={{start: parseDate("2026-10-12"), end: parseDate("2026-10-15")}}><M.RangeCalendar.Header><M.RangeCalendar.NavButton slot="previous" /><M.RangeCalendar.Heading /><M.RangeCalendar.NavButton slot="next" /></M.RangeCalendar.Header><M.RangeCalendar.Grid><M.RangeCalendar.GridHeader>{day => <M.RangeCalendar.HeaderCell>{day}</M.RangeCalendar.HeaderCell>}</M.RangeCalendar.GridHeader><M.RangeCalendar.GridBody>{date => <M.RangeCalendar.Cell date={date} />}</M.RangeCalendar.GridBody></M.RangeCalendar.Grid></M.RangeCalendar>) };
