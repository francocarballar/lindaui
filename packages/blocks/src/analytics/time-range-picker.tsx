"use client";

import { DateField, DateRangePicker, Label, RangeCalendar } from "@lindaui/ui/compound";
import { getLocalTimeZone, today } from "@internationalized/date";
import { type ComponentProps, memo, useState } from "react";
import type { Preset, TimeRangePickerProps } from "./types";

const PRESETS: Preset[] = ["24h", "7d", "30d", "custom"];
// Preserve the public date types when HeroUI resolves its own date package copy.
type DateRangePickerValueProps = Pick<ComponentProps<typeof DateRangePicker>, "maxValue" | "onChange" | "value">;
export const TimeRangePicker = memo(({ preset, customRange, onPresetChange, onCustomRangeChange, t }: TimeRangePickerProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const maxDate = today(getLocalTimeZone());
  function handlePresetChange(p: Preset) { onPresetChange(p); if (p === "custom") setIsPickerOpen(true); }
  const handlePresetClick = (p: Preset) => () => handlePresetChange(p);
  return <div className="flex items-center gap-3">
    <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-surface p-1 shadow-sm">
      {PRESETS.map((p) => <button className={`cursor-pointer rounded-lg px-3.5 py-1.5 font-medium text-sm transition-all duration-150 ${preset === p ? "bg-accent text-accent-foreground shadow-sm" : "text-muted hover:bg-surface-secondary hover:text-foreground"}`} key={p} onClick={handlePresetClick(p)} type="button">{t(`analytics.timeRange.${p}`)}</button>)}
    </div>
    {preset === "custom" && <DateRangePicker className="max-w-xs" isOpen={isPickerOpen} maxValue={maxDate as unknown as DateRangePickerValueProps["maxValue"]} onChange={onCustomRangeChange as unknown as DateRangePickerValueProps["onChange"]} onOpenChange={setIsPickerOpen} value={customRange as unknown as DateRangePickerValueProps["value"]}>
      <Label className="sr-only">{t("analytics.timeRange.label")}</Label>
      <DateField.Group className="shadow-sm">
        <DateField.InputContainer>
          <DateField.Input slot="start">{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end">{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.InputContainer>
        <DateField.Suffix><DateRangePicker.Trigger><DateRangePicker.TriggerIndicator /></DateRangePicker.Trigger></DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Popover><RangeCalendar aria-label={t("analytics.timeRange.label")} pageBehavior="single">
        <RangeCalendar.Header>
          <RangeCalendar.YearPickerTrigger><RangeCalendar.YearPickerTriggerHeading /><RangeCalendar.YearPickerTriggerIndicator /></RangeCalendar.YearPickerTrigger>
          <RangeCalendar.NavButton slot="previous" /><RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>{(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}</RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>{(date) => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody>
        </RangeCalendar.Grid>
        <RangeCalendar.YearPickerGrid><RangeCalendar.YearPickerGridBody>{({ year }) => <RangeCalendar.YearPickerCell year={year} />}</RangeCalendar.YearPickerGridBody></RangeCalendar.YearPickerGrid>
      </RangeCalendar></DateRangePicker.Popover>
    </DateRangePicker>}
  </div>;
});
