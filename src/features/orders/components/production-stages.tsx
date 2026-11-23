"use client";

import { Check, Clock, Factory } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card, CardTitle, cx, useToast } from "@/components/ui";
import { api } from "@/lib/api-client";
import { STAGES } from "@/lib/stages";

/** Linha do tempo das etapas: concluída (verde), em andamento (a primeira não concluída, destacada) e pendente. */
export function StageStepper({ done, onToggle, disabled }: { done: string[]; onToggle: (key: string) => void; disabled?: boolean }) {
  const current = STAGES.find((s) => !done.includes(s.key))?.key;
  return (
    <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-0">
      {STAGES.map((s, i) => {
        const on = done.includes(s.key);
        const now = s.key === current;
        return (
          <li key={s.key} className="flex items-center sm:contents">
            <button type="button" disabled={disabled} onClick={() => onToggle(s.key)} aria-pressed={on} aria-current={now ? "step" : undefined}
              className="flex w-full items-center gap-3 rounded-lg py-1 text-left disabled:opacity-60 sm:w-[84px] sm:shrink-0 sm:flex-col sm:gap-1.5 sm:text-center">
              <span className={cx("grid h-[44px] w-[52px] shrink-0 place-items-center rounded-[10px] border-[1.5px]",
                on ? "border-ok bg-ok text-white" : now ? "border-navy bg-surface text-ink" : "border-slate bg-surface text-muted")}>
                {on ? <Check size={20} strokeWidth={3} /> : <Clock size={20} />}
              </span>
              <span className={cx("text-xs leading-4", now ? "font-extrabold text-ink" : on ? "text-ink" : "text-muted")}>{s.label}</span>
            </button>
            {i < STAGES.length - 1 && <span aria-hidden className={cx("hidden h-[3px] min-w-3 flex-1 self-start sm:mt-[20px] sm:block", on ? "bg-ok" : "bg-line")} />}
          </li>
        );
      })}
    </ol>
  );
}

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
      <StageStepper done={done} onToggle={toggle} disabled={pending} />
    </Card>
  );
}
