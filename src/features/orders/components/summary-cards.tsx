import { AlertTriangle, Calendar, Check, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { api } from "@/lib/api-server";

function Stat({ icon, tone, value, label }: { icon: ReactNode; tone: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 sm:gap-4 sm:p-5 shadow-[0_1px_3px_rgba(11,20,69,.06)]">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 ${tone}`}>{icon}</span>
      <div>
        <div className="text-2xl font-extrabold leading-none sm:text-3xl">{value}</div>
        <div className="mt-1 text-xs font-semibold leading-tight text-muted sm:text-sm">{label}</div>
      </div>
    </div>
  );
}

export async function SummaryCards() {
  const s = await api.orders.summary();
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-4">
      <Stat icon={<Clock size={22} />} tone="bg-amber-soft text-ink" value={s.pending} label="Encomendas pendentes" />
      <Stat icon={<AlertTriangle size={22} />} tone="bg-crimson-soft text-crimson-ink" value={s.urgent} label="Urgentes" />
      <Stat icon={<Calendar size={22} />} tone="bg-crimson-soft text-crimson-ink" value={s.dueIn7Days} label="Entregam nos próximos 7 dias" />
      <Stat icon={<Check size={22} />} tone="bg-ok-soft text-ok-ink" value={s.deliveredThisMonth} label="Entregues neste mês" />
    </div>
  );
}
