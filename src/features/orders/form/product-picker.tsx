"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { cx } from "@/components/ui";
import type { Mold, MoldCategory } from "@/lib/types";
import { categoryIcon, CATEGORY_LABEL } from "@/features/molds/category";

const COLUMNS: { cat: MoldCategory; title: string }[] = [
  { cat: "BLUSA", title: "BLUSAS" }, { cat: "ESTOJO_BOLSA", title: "ESTOJOS E BOLSAS" }, { cat: "OUTRO", title: "OUTROS PRODUTOS" },
];

export function ProductPicker({ molds, onPick, onCreate }: { molds: Mold[]; onPick: (m: Mold) => void; onCreate: () => void }) {
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const filtered = molds.filter((m) => !t || m.name.toLowerCase().includes(t) || m.group?.toLowerCase().includes(t));

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
      <label className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <Search size={17} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Buscar tipo de produto ou molde…" className="flex-1 bg-transparent font-semibold outline-none placeholder:font-normal" />
      </label>
      <div className="grid gap-6 px-5 py-4 md:grid-cols-3">
        {COLUMNS.map(({ cat, title }) => (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold tracking-wider text-muted">{categoryIcon(cat, 14)}{title}</div>
            <ul>
              {filtered.filter((m) => m.category === cat).map((m) => {
                const origin = m.variationOfId && molds.find((x) => x.id === m.variationOfId);
                return (
                  <li key={m.id}>
                    <button type="button" onClick={() => onPick(m)} className={cx("w-full rounded-lg px-2.5 py-2 text-left hover:bg-navy-soft")}>
                      <span className="block text-sm font-bold">{m.name}</span>
                      {(origin || m.models) && <span className="block text-[11px] text-muted">{origin ? `variação de ${origin.name}` : `${m.models?.length} modelos · ${m.gridIds?.length} grades de tamanho`}</span>}
                    </button>
                  </li>
                );
              })}
              {!filtered.some((m) => m.category === cat) && <li className="px-2.5 py-2 text-xs text-muted">{CATEGORY_LABEL[cat]}: nenhum resultado</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-cream-2 px-5 py-3 text-xs">
        <button type="button" onClick={onCreate} className="flex items-center gap-1.5 text-sm font-bold text-crimson"><Plus size={15} />Cadastrar novo tipo de produto</button>
        <span className="text-muted">Não encontrou o molde? Cadastre sem sair do pedido.</span>
      </div>
    </div>
  );
}
