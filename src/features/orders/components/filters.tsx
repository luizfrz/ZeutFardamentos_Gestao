"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cx } from "@/components/ui";

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
    </section>
  );
}
