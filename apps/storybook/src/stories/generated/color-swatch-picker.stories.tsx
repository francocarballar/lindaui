import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/color-swatch-picker";
import { useState } from "react";
function SwatchesDemo() { const [color, setColor] = useState("#7c3aed"); return <><M.ColorSwatchPicker aria-label="Color del tema" value={color} onChange={value => setColor(value.toString("hex"))}>{["#7c3aed", "#0d9488", "#e11d48"].map(value => <M.ColorSwatchPicker.Item key={value} color={value}><M.ColorSwatchPicker.Swatch /><M.ColorSwatchPicker.Indicator /></M.ColorSwatchPicker.Item>)}</M.ColorSwatchPicker><output role="status">{color}</output></>; }

const meta: Meta = { title: "Components/ColorSwatchPicker" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<SwatchesDemo />) };
