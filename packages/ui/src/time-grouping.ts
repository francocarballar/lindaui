import { formatRelativeTime } from "./date";

/**
 * Agrupador puro por día calendario — pensado para timelines de conversación
 * (`conversation-thread`). Asume `items` ya ordenados cronológicamente.
 */
export interface TimeGroup<T> {
  key: string;
  label: string;
  items: T[];
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function groupByDay<T>(
  items: T[],
  getDate: (item: T) => Date | number | string,
): TimeGroup<T>[] {
  const groups: TimeGroup<T>[] = [];
  let currentKey: string | null = null;

  for (const item of items) {
    const raw = getDate(item);
    const date = raw instanceof Date ? raw : new Date(raw);
    const key = dayKey(date);
    if (key !== currentKey) {
      groups.push({ key, label: formatRelativeTime(date), items: [] });
      currentKey = key;
    }
    groups[groups.length - 1].items.push(item);
  }

  return groups;
}
