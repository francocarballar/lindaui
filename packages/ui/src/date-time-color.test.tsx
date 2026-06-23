import { describe, test, expect } from "vitest";
import { DateInput } from "./date-input";
import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./date-range-picker";
import { TimeInput } from "./time-input";
import { Calendar } from "./calendar";
import { RangeCalendar } from "./range-calendar";
import { ColorPicker } from "./color-picker";
import { ColorArea } from "./color-area";
import { ColorSlider } from "./color-slider";
import { ColorField } from "./color-field";
import { ColorSwatch } from "./color-swatch";
import { ColorSwatchPicker } from "./color-swatch-picker";

// These HeroUI v3 components are compound RAC compositions requiring
// @internationalized/date values + sub-component assembly to render
// meaningfully; the wrappers re-export them, so we assert the public surface
// resolves rather than rendering a half-composition.
describe("Date/Time + Color suite exports", () => {
  test.each([
    ["DateInput", DateInput],
    ["DatePicker", DatePicker],
    ["DateRangePicker", DateRangePicker],
    ["TimeInput", TimeInput],
    ["Calendar", Calendar],
    ["RangeCalendar", RangeCalendar],
    ["ColorPicker", ColorPicker],
    ["ColorArea", ColorArea],
    ["ColorSlider", ColorSlider],
    ["ColorField", ColorField],
    ["ColorSwatch", ColorSwatch],
    ["ColorSwatchPicker", ColorSwatchPicker],
  ])("%s is exported", (_name, Component) => {
    expect(Component).toBeDefined();
  });
});
