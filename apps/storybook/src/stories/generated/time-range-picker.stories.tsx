import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/time-range-picker";
import { useState } from "react";
function TimeRangeDemo() { const [preset, setPreset] = useState("today"); const [range, setRange] = useState({start: "2026-10-12", end: "2026-10-15"}); return <div className="space-y-3"><M.TimeRangePicker activePreset={preset} onPresetChange={setPreset} range={range} onRangeChange={setRange} /><output role="status">{preset === "custom" ? `${range.start} → ${range.end}` : preset}</output></div>; }

const meta: Meta = { title: "Components/TimeRangePicker" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<TimeRangeDemo />) };
