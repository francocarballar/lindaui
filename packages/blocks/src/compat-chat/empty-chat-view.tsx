import { MessageCircle } from "lucide-react";

export interface EmptyChatViewProps { description: string; title: string; }
export function EmptyChatView({ title, description }: EmptyChatViewProps) {
  return <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-8 text-center">
    <div className="rounded-full bg-surface-secondary p-4"><MessageCircle className="h-8 w-8 text-muted" /></div>
    <div className="space-y-2"><h3 className="font-semibold text-foreground text-lg">{title}</h3><p className="text-muted text-sm">{description}</p></div>
  </div>;
}
