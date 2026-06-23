import { Badge } from "./badge";

export type InformeStatus = "BORRADOR" | "CONFIRMADO" | "FIRMADO";

const statusMap: Record<
  InformeStatus,
  { label: string; variant: "default" | "warning" | "success" }
> = {
  BORRADOR: { label: "Borrador", variant: "default" },
  CONFIRMADO: { label: "Confirmado", variant: "warning" },
  FIRMADO: { label: "Firmado", variant: "success" },
};

export function StatusChip({ status }: { status: InformeStatus }) {
  const { label, variant } = statusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
}
