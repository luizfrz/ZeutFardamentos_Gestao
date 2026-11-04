import { Check, Clock } from "lucide-react";
import { cx } from "@/lib/cn";
import type { OrderStatus, Priority } from "@/lib/types";

const PRIORITY: Record<Priority, { label: string; cls: string; dot: string }> = {
  URGENTE: { label: "URGENTE", cls: "bg-crimson text-white", dot: "bg-white" },
  ALTA: { label: "ALTA", cls: "bg-coral text-white", dot: "bg-white" },
  MEDIA: { label: "MÉDIA", cls: "bg-amber text-ink", dot: "bg-ink" },
  BAIXA: { label: "BAIXA", cls: "bg-navy-soft text-ink", dot: "bg-ink" },
};
export const PRIORITY_BAR: Record<Priority, string> = { URGENTE: "bg-crimson", ALTA: "bg-coral", MEDIA: "bg-amber", BAIXA: "bg-slate" };

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY[priority];
  return (
    <span className={cx("inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide", p.cls)}>
      <span className={cx("h-1.5 w-1.5 rounded-full", p.dot)} />{p.label}
    </span>
  );
}

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  NAO_INICIADO: { label: "Não iniciado", cls: "bg-navy-soft text-ink" },
  PENDENTE: { label: "Pendente", cls: "bg-amber-soft text-ink" },
  CONCLUIDO: { label: "Concluído", cls: "bg-ok-soft text-ok" },
};
export const STATUS_LABEL = (s: OrderStatus) => STATUS[s].label;

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", s.cls)}>
      {status === "CONCLUIDO" ? <Check size={14} /> : <Clock size={14} />}{s.label}
    </span>
  );
}
