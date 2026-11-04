import { Check } from "lucide-react";
import { cx } from "@/components/ui";
import type { OrderStatus } from "@/lib/types";

export function Lifecycle({ status }: { status: OrderStatus }) {
  const steps: { key: OrderStatus; label: string }[] = [
    { key: "NAO_INICIADO", label: "Não iniciado" }, { key: "PENDENTE", label: "Pendente" }, { key: "CONCLUIDO", label: "Concluído" },
  ];
  const cur = steps.findIndex((s) => s.key === status);
  return (
    <div className="mt-5">
      <div className="mb-3 text-sm font-semibold text-muted">Ciclo de vida</div>
      <ol className="flex items-start">
        {steps.map((s, i) => (
          <li key={s.key} className="flex flex-1 flex-col last:flex-none">
            <div className="flex items-center">
              <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2",
                i < cur || status === "CONCLUIDO" ? "border-ok bg-ok text-white" : i === cur ? "border-navy bg-navy" : "border-slate bg-white")}>
                {i < cur || status === "CONCLUIDO" ? <Check size={14} strokeWidth={3.5} /> : i === cur && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              {i < steps.length - 1 && <span className={cx("mx-2 h-0.5 flex-1", i < cur ? "bg-ok" : "bg-line")} />}
            </div>
            <span className={cx("mt-1.5 text-xs font-semibold", i === cur ? "text-ink" : "text-muted")}>{s.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
