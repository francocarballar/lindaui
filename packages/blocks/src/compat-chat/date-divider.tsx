import dayjs from "dayjs";
import { isToday, isYesterday } from "@lindaui/ui/compat";

export interface DateDividerProps { date: string | Date; }
export function DateDivider({ date }: DateDividerProps) {
  return <div className="flex justify-center py-2"><span className="rounded-lg bg-surface-secondary px-3 py-1 text-muted text-xs shadow-sm dark:bg-surface-secondary/50">{isToday(date) ? "Hoy" : isYesterday(date) ? "Ayer" : dayjs(date).format("DD/MM/YYYY")}</span></div>;
}
