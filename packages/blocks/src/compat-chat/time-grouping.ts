import dayjs from "dayjs";

export type TimeGroup = "Hoy" | "Ayer" | "Esta semana" | "Este mes" | "Más antiguos";
export const TIME_GROUP_ORDER = ["Hoy", "Ayer", "Esta semana", "Este mes", "Más antiguos"] as const satisfies readonly TimeGroup[];
export function getTimeGroup(date: string | Date): TimeGroup {
  const now = dayjs();
  const target = dayjs(date);
  if (target.isSame(now, "day")) return "Hoy";
  if (target.isSame(now.subtract(1, "day"), "day")) return "Ayer";
  if (target.isAfter(now.subtract(7, "day"))) return "Esta semana";
  if (target.isAfter(now.subtract(30, "day"))) return "Este mes";
  return "Más antiguos";
}
export function groupByTime<T>(items: T[], getDate: (item: T) => string | Date): Record<TimeGroup, T[]> {
  const grouped = {} as Record<TimeGroup, T[]>;
  for (const group of TIME_GROUP_ORDER) grouped[group] = [];
  items.forEach((item) => grouped[getTimeGroup(getDate(item))].push(item));
  return grouped;
}
