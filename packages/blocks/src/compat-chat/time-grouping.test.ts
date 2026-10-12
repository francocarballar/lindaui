import { afterEach, expect, test, vi } from "vitest";
import { getTimeGroup, groupByTime, TIME_GROUP_ORDER } from "./time-grouping";

afterEach(() => vi.useRealTimers());

test("legacy timelines preserve every age bucket and its boundary", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 12, 12));
  const samples = [
    { date: new Date(2026, 9, 12, 1), group: "Hoy" },
    { date: new Date(2026, 9, 11, 23), group: "Ayer" },
    { date: new Date(2026, 9, 10, 12), group: "Esta semana" },
    { date: new Date(2026, 9, 5, 12), group: "Este mes" },
    { date: new Date(2026, 8, 12, 12), group: "Más antiguos" },
  ];
  for (const sample of samples) expect(getTimeGroup(sample.date)).toBe(sample.group);
  const groups = groupByTime(samples, (sample) => sample.date);
  expect(Object.keys(groups)).toEqual(TIME_GROUP_ORDER);
  for (const sample of samples) expect(groups[sample.group as keyof typeof groups]).toContain(sample);
  expect(groupByTime([], (date: string) => date)).toEqual(Object.fromEntries(TIME_GROUP_ORDER.map((key) => [key, []])));
});
