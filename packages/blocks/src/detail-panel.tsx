"use client";
import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { Button } from "@lindaui/ui/button";
import { Card } from "@lindaui/ui/card";
import { Divider } from "@lindaui/ui/divider";

export interface DetailPanelMetaRow {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
}

export interface DetailPanelAction {
  label: ReactNode;
  onPress: () => void;
  icon?: ReactNode;
}

export interface DetailPanelProps {
  selected?: boolean;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyIcon?: ReactNode;
  title?: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
  media?: ReactNode;
  meta?: DetailPanelMetaRow[];
  action?: DetailPanelAction;
}

export function DetailPanel({
  selected = false,
  emptyTitle = "Seleccioná un elemento",
  emptyDescription,
  emptyIcon,
  title,
  subtitle,
  badges,
  media,
  meta,
  action,
}: DetailPanelProps) {
  if (!selected || title === undefined) {
    return (
      <div className="grid h-full place-items-center p-6 sm:p-10">
        <div className="max-w-[280px] text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
            {emptyIcon ?? <FileText className="h-7 w-7 text-muted-foreground" strokeWidth={1.6} />}
          </div>
          <h3 className="mt-4 text-[15px] font-semibold">{emptyTitle}</h3>
          {emptyDescription && (
            <p className="mt-1.5 text-sm text-muted-foreground">{emptyDescription}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
      <div className="mx-auto max-w-2xl">
        <div>
          {badges && (
            <div className="flex flex-wrap items-center gap-2.5">{badges}</div>
          )}
          <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {(media || (meta && meta.length > 0)) && (
          // Mobile-first: stack (media arriba, meta abajo). Desde `sm` y solo
          // cuando hay media, split en dos columnas (media fija 200px + meta
          // 1fr). Sin media la Card de metadata ocupa todo el ancho siempre
          // (si no, queda atrapada en la columna 1fr con un gutter vacío).
          <div
            className={
              media
                ? "mt-6 flex flex-col gap-4 sm:grid sm:grid-cols-[200px_1fr] sm:gap-6"
                : "mt-6"
            }
          >
            {media && <div>{media}</div>}
            {meta && meta.length > 0 && (
              <Card>
                <div className="px-4 py-1">
                  {meta.map((row, i) => (
                    <div key={i}>
                      {i > 0 && <Divider />}
                      <div className="flex items-start gap-2.5 py-2.5">
                        {row.icon && (
                          <div className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground">
                            {row.icon}
                          </div>
                        )}
                        <div className="flex flex-1 justify-between gap-3">
                          <span className="text-sm text-muted-foreground">{row.label}</span>
                          <span className="text-right text-sm font-medium">{row.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {action && (
          <div className="mt-6">
            <Button size="lg" onPress={action.onPress} className="w-full sm:w-auto">
              {action.icon}
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
