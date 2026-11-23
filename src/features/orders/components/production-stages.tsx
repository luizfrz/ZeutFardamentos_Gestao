"use client";

import { Check, Factory } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card, CardTitle, cx, useToast } from "@/components/ui";
import { api } from "@/lib/api-client";
import { STAGES } from "@/lib/stages";

export function ProductionStages({ id, stages }: { id: string; stages: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(stages);

  function toggle(key: string) {
    const next = done.includes(key) ? done.filter((k) => k !== key) : [...done, key];
    const prev = done;
    setDone(next);
    start(async () => {
      try { await api.orders.setStages(id, next); router.refresh(); }
      catch (e) { setDone(prev); toast.error("Não foi possível atualizar a etapa", (e as Error).message); }
    });
  }

  return (
    <Card className="p-6">
      <CardTitle icon={<Factory size={20} />}>Etapas de produção</CardTitle>
      <p className="mt-1 text-xs font-semibold text-muted">Opcional. Ao concluir o pedido, todas as etapas são marcadas.</p>
      <ol className="mt-4 space-y-1">
        {STAGES.map((s) => {
          const on = done.includes(s.key);
          return (
            <li key={s.key}>
              <button type="button" disabled={pending} onClick={() => toggle(s.key)} aria-pressed={on}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-bold hover:bg-navy-soft/60 disabled:opacity-60">
                <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2", on ? "border-ok bg-ok text-white" : "border-slate bg-surface")}>
                  {on && <Check size={13} strokeWidth={3.5} />}
                </span>
                <span className={on ? "text-ink" : "text-muted"}>{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
