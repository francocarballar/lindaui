import { cn } from "@lindaui/ui/cn";

export function TimeDivider({ label, className }: { className?: string; label: string }) {
  return <div className={cn("sticky top-0 z-10 bg-background/80 px-4 py-2 backdrop-blur-sm", className)}><span className="font-medium text-[11px] text-muted">{label}</span></div>;
}
