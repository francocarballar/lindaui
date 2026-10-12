import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/date-range-picker";
import { parseDate } from "@internationalized/date";
import { Label, DateField, RangeCalendar } from "@lindaui/ui/compound";

const meta: Meta = { title: "Components/DateRangePicker" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.DateRangePicker defaultValue={{start: parseDate("2026-10-12"), end: parseDate("2026-10-15")}}><Label>Período</Label><DateField.Group><DateField.InputContainer><DateField.Input slot="start">{segment => <DateField.Segment segment={segment} />}</DateField.Input><M.DateRangePicker.RangeSeparator /><DateField.Input slot="end">{segment => <DateField.Segment segment={segment} />}</DateField.Input></DateField.InputContainer><DateField.Suffix><M.DateRangePicker.Trigger aria-label="Elegir período"><M.DateRangePicker.TriggerIndicator /></M.DateRangePicker.Trigger></DateField.Suffix></DateField.Group><M.DateRangePicker.Popover><RangeCalendar aria-label="Período"><RangeCalendar.Header><RangeCalendar.NavButton slot="previous" /><RangeCalendar.Heading /><RangeCalendar.NavButton slot="next" /></RangeCalendar.Header><RangeCalendar.Grid><RangeCalendar.GridHeader>{day => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}</RangeCalendar.GridHeader><RangeCalendar.GridBody>{date => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody></RangeCalendar.Grid></RangeCalendar></M.DateRangePicker.Popover></M.DateRangePicker>) };
