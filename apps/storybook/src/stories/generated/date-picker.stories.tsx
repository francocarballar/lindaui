import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/date-picker";
import { parseDate } from "@internationalized/date";
import { Label, DateField, Calendar } from "@lindaui/ui/compound";

const meta: Meta = { title: "Components/DatePicker" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.DatePicker defaultValue={parseDate("2026-10-12")}><Label>Fecha del turno</Label><DateField.Group><DateField.Input>{segment => <DateField.Segment segment={segment} />}</DateField.Input><DateField.Suffix><M.DatePicker.Trigger aria-label="Elegir fecha"><M.DatePicker.TriggerIndicator /></M.DatePicker.Trigger></DateField.Suffix></DateField.Group><M.DatePicker.Popover><Calendar aria-label="Fecha del turno"><Calendar.Header><Calendar.NavButton slot="previous" /><Calendar.Heading /><Calendar.NavButton slot="next" /></Calendar.Header><Calendar.Grid><Calendar.GridHeader>{day => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader><Calendar.GridBody>{date => <Calendar.Cell date={date} />}</Calendar.GridBody></Calendar.Grid></Calendar></M.DatePicker.Popover></M.DatePicker>) };
