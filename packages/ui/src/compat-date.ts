import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/es.js";

dayjs.extend(relativeTime);

/** Legacy relative-time semantics, separate from lindaui's calendar-date helper. */
export function formatRelativeTime(date: string | Date, locale = "es"): string {
  return dayjs(date).locale(locale).fromNow();
}
export function isToday(date: string | Date): boolean { return dayjs(date).isSame(dayjs(), "day"); }
export function isYesterday(date: string | Date): boolean { return dayjs(date).isSame(dayjs().subtract(1, "day"), "day"); }
