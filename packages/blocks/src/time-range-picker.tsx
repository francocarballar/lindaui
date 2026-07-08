"use client";
import { Button } from "@lindaui/ui/button";

export interface TimeRangePreset {
  key: string;
  label: string;
}

export interface TimeRangeValue {
  start: string;
  end: string;
}

export interface TimeRangePickerProps {
  presets?: TimeRangePreset[];
  activePreset: string;
  onPresetChange: (key: string) => void;
  /** Key del preset que revela los inputs de rango custom. Default `"custom"`. */
  customKey?: string;
  range?: TimeRangeValue;
  onRangeChange?: (range: TimeRangeValue) => void;
  startLabel?: string;
  endLabel?: string;
}

const DEFAULT_PRESETS: TimeRangePreset[] = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "Últimos 7 días" },
  { key: "30d", label: "Últimos 30 días" },
  { key: "custom", label: "Personalizado" },
];

const fieldInputClass =
  "rounded-[var(--field-radius)] border border-[var(--field-border)] bg-[var(--field-background)] px-2 py-1 text-sm text-[var(--field-foreground)]";

/**
 * Presets + rango custom, controlado. El custom usa `<input type="date">` nativo
 * (no el `date-range-picker` de HeroUI): evita traer `@internationalized/date` a
 * un caso de uso simple de fecha-a-fecha.
 */
export function TimeRangePicker({
  presets = DEFAULT_PRESETS,
  activePreset,
  onPresetChange,
  customKey = "custom",
  range,
  onRangeChange,
  startLabel = "Desde",
  endLabel = "Hasta",
}: TimeRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button
            key={p.key}
            variant={activePreset === p.key ? "primary" : "ghost"}
            size="sm"
            onPress={() => onPresetChange(p.key)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {activePreset === customKey && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">{startLabel}</span>
            <input
              type="date"
              value={range?.start ?? ""}
              onChange={(e) => onRangeChange?.({ start: e.target.value, end: range?.end ?? "" })}
              className={fieldInputClass}
            />
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">{endLabel}</span>
            <input
              type="date"
              value={range?.end ?? ""}
              onChange={(e) => onRangeChange?.({ start: range?.start ?? "", end: e.target.value })}
              className={fieldInputClass}
            />
          </label>
        </div>
      )}
    </div>
  );
}
