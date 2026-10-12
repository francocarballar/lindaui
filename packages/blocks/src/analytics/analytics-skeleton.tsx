"use client";

import { Skeleton } from "@lindaui/ui/compound";
import { Building2, Loader2, Wifi } from "lucide-react";
import { KPICard } from "../legacy-kpi-card";

export function AnalyticsSkeleton() {
  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{["a", "b", "c", "d"].map((k) => <KPICard icon={Building2} isLoading key={k} title="" value="" />)}</div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{["e", "f", "g"].map((k) => <KPICard icon={Wifi} isLoading key={k} title="" value="" />)}</div>
    <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-72 w-full rounded-xl" /><Skeleton className="h-72 w-full rounded-xl" /></div>
    <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-64 w-full rounded-xl" /><Skeleton className="h-64 w-full rounded-xl" /></div>
  </div>;
}
export function FetchingIndicator({ label }: { label: string }) { return <div className="flex items-center gap-1.5 text-muted text-xs"><Loader2 className="h-3 w-3 animate-spin" /><span>{label}</span></div>; }
