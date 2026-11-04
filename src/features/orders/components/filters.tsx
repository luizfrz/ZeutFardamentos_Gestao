"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cx, Select } from "@/components/ui";

const PRIORITIES = [["", "Todas"], ["URGENTE", "Urgente"], ["ALTA", "Alta"], ["MEDIA", "Média"], ["BAIXA", "Baixa"]] as const;

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }
  const priority = params.get("priority") ?? "";

  return (
    <section id="filtros" className="flex scroll-mt-6 flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="mr-1 text-sm font-bold text-muted">Prioridade:</span>
        {PRIORITIES.map(([v, label]) => (
          <button
            key={v} type="button" onClick={() => set("priority", v)} aria-pressed={priority === v}
            className={cx("flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition-colors",
              priority === v ? "border-navy bg-navy text-white" : "border-slate bg-surface hover:bg-navy-soft/60")}
          >{priority === v && <Check size={14} />}{label}</button>
        ))}
      </div>
      <div className="ml-auto flex flex-wrap gap-3">
        <LabeledSelect label="Prazo de entrega" value={params.get("deadline") ?? ""} onChange={(v) => set("deadline", v)}
          options={[["", "Todos os prazos"], ["7", "Até 7 dias"], ["14", "Até 14 dias"], ["LATE", "Atrasadas"]]} />
        <LabeledSelect label="Ciclo de vida" value={params.get("status") ?? ""} onChange={(v) => set("status", v)}
          options={[["", "Pendentes e não iniciados"], ["PENDENTE", "Somente pendentes"], ["NAO_INICIADO", "Somente não iniciados"]]} />
        <LabeledSelect label="Ordenar por" value={params.get("sort") ?? ""} onChange={(v) => set("sort", v)}
          options={[["", "Prioridade"], ["deadline", "Prazo de entrega"], ["quantity", "Quantidade"]]} />
      </div>
    </section>
  );
}

function LabeledSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: readonly (readonly [string, string])[];
}) {
  return (
    <label className="block min-w-44">
      <span className="mb-1 block pl-1 text-xs font-semibold text-muted">{label}</span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="py-2 font-extrabold">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </Select>
    </label>
  );
}
