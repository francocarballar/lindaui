import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/color-picker";
import { useState } from "react";
import { ColorArea, ColorSlider } from "@lindaui/ui/compound";
function ColorPickerDemo() { const [color, setColor] = useState("#7c3aed"); return <><M.ColorPicker value={color} onChange={value => setColor(value.toString("hex"))}><M.ColorPicker.Trigger>Elegir color</M.ColorPicker.Trigger><M.ColorPicker.Popover><ColorArea aria-label="Saturación y brillo" colorSpace="hsb" xChannel="saturation" yChannel="brightness"><ColorArea.Thumb /></ColorArea><ColorSlider aria-label="Tono" colorSpace="hsb" channel="hue"><ColorSlider.Track><ColorSlider.Thumb /></ColorSlider.Track></ColorSlider></M.ColorPicker.Popover></M.ColorPicker><output role="status">{color}</output></>; }

const meta: Meta = { title: "Components/ColorPicker" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<ColorPickerDemo />) };
