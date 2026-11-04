import { AlertTriangle, Calendar, Check, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { api } from "@/lib/api";

function Stat({ icon, tone, value, label }: { icon: ReactNode; tone: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_3px_rgba(11,20,69,.06)]">
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <div>
        <div className="text-3xl font-extrabold leading-none">{value}</div>
        <div className="mt-1 text-sm font-semibold text-muted">{label}</div>
      </div>
    </div>
  );
}

export async function SummaryCards() {
  const s = await api.orders.summary();
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={<Clock size={22} />} tone="bg-amber-soft text-ink" value={s.pending} label="Encomendas pendentes" />
      <Stat icon={<AlertTriangle size={22} />} tone="bg-crimson-soft text-crimson" value={s.urgent} label="Urgentes" />
      <Stat icon={<Calendar size={22} />} tone="bg-crimson-soft text-crimson" value={s.dueIn7Days} label="Entregam nos próximos 7 dias" />
      <Stat icon={<Check size={22} />} tone="bg-ok-soft text-ok" value={s.deliveredThisMonth} label="Entregues neste mês" />
    </div>
  );
}
