import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { groupByDay } from "./time-grouping";

interface Msg {
  id: string;
  at: string;
}

describe("groupByDay", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-07-08T15:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("groups consecutive same-day items together", () => {
    const items: Msg[] = [
      { id: "1", at: "2026-07-08T08:00:00" },
      { id: "2", at: "2026-07-08T09:00:00" },
    ];
    const groups = groupByDay(items, (m) => m.at);
    expect(groups).toHaveLength(1);
    expect(groups[0].items.map((m) => m.id)).toEqual(["1", "2"]);
    expect(groups[0].label).toBe("Hoy");
  });

  test("starts a new group on a day boundary", () => {
    const items: Msg[] = [
      { id: "1", at: "2026-07-07T08:00:00" },
      { id: "2", at: "2026-07-08T09:00:00" },
    ];
    const groups = groupByDay(items, (m) => m.at);
    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe("Ayer");
    expect(groups[1].label).toBe("Hoy");
  });

  test("returns an empty array for no items", () => {
    expect(groupByDay<Msg>([], (m) => m.at)).toEqual([]);
  });
  test("accepts Date objects and numeric timestamps", () => {
    const first = new Date(2026, 6, 8, 8);
    const second = new Date(2026, 6, 8, 9).getTime();
    const result = groupByDay([first, second], (value) => value);
    expect(result).toEqual([{ key: "2026-07-08", label: "Hoy", items: [first, second] }]);
  });
});
