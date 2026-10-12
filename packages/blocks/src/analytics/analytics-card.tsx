"use client";

import { Card } from "@lindaui/ui/compound";
import type { AnalyticsCardProps } from "./types";

export function AnalyticsCard({ icon: Icon, title, action, children }: AnalyticsCardProps) {
  return <Card className="border border-border bg-surface shadow-none">
    <Card.Header className="flex items-center justify-between px-5 pt-5 pb-0">
      <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/8"><Icon className="h-4 w-4 text-accent" /></div><h2 className="font-semibold text-foreground text-sm">{title}</h2></div>
      {action}
    </Card.Header>
    <Card.Content className="px-5 pt-4 pb-5">{children}</Card.Content>
  </Card>;
}
