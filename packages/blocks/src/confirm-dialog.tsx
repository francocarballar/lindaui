"use client";
import type { ReactNode } from "react";
import { Dialog } from "@lindaui/ui/dialog";
import { Button } from "@lindaui/ui/button";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: ReactNode;
  /** Acción irreversible: botón de confirmar en rojo + icon box destructivo. */
  destructive?: boolean;
  /** Chip del actor responsable (ej. firmante) bajo la descripción. */
  identity?: { name: string };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((p) => p.length > 0)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  icon,
  destructive = false,
  identity,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={title}
      footer={
        <div className="flex flex-col-reverse gap-2 w-full sm:flex-row sm:justify-end sm:w-auto">
          <Button variant="ghost" onPress={() => onOpenChange(false)} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onPress={onConfirm}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {icon && (
        <div
          className={`w-10 h-10 rounded-[10px] grid place-items-center mb-3.5 ${
            destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {identity && (
        <div className="mt-4 px-3.5 py-3 rounded-[calc(var(--radius)-2px)] bg-muted flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-xs font-semibold shrink-0">
            {getInitials(identity.name)}
          </div>
          <span className="text-xs font-semibold">{identity.name}</span>
        </div>
      )}
    </Dialog>
  );
}
