"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog, useToast } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import type { Mold, MoldCategory } from "@/lib/types";
import { categoryIcon, CATEGORY_LABEL } from "@/features/molds/category";

const COLUMNS: { cat: MoldCategory; title: string }[] = [
  { cat: "BLUSA", title: "VESTUÁRIO" }, { cat: "ESTOJO_BOLSA", title: "ESTOJOS E BOLSAS" }, { cat: "OUTRO", title: "OUTROS PRODUTOS" },
];

export function ProductPicker({ molds, inUseIds, onPick, onCreate, onDeleted }: {
  molds: Mold[]; inUseIds: string[]; onPick: (m: Mold) => void; onCreate: () => void; onDeleted: (id: string) => void;
}) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState<Mold | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const t = q.trim().toLowerCase();
  const filtered = molds.filter((m) => !t || m.name.toLowerCase().includes(t) || m.group?.toLowerCase().includes(t));

  function askDelete(m: Mold) {
    setDeleteError(inUseIds.includes(m.id) ? "Este molde está em um dos produtos deste pedido. Remova-o do pedido antes de excluir." : null);
    setToDelete(m);
  }

  async function confirmDelete() {
    if (!toDelete || inUseIds.includes(toDelete.id)) return;
    setDeleting(true); setDeleteError(null);
    try {
      await api.molds.remove(toDelete.id);
      toast.success("Molde excluído", toDelete.name);
      onDeleted(toDelete.id);
      setToDelete(null);
    } catch (e) {
      setDeleteError(e instanceof ApiError ? e.messages.join(" ") : "Não foi possível excluir o molde.");
    } finally { setDeleting(false); }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
      <label className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <Search size={17} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Buscar tipo de produto ou molde…" className="flex-1 bg-transparent py-2 font-semibold outline-none placeholder:font-normal" />
      </label>
      <div className="grid gap-6 px-5 py-4 md:grid-cols-3">
        {COLUMNS.map(({ cat, title }) => (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold tracking-wider text-muted">{categoryIcon(cat, 14)}{title}</div>
            <ul>
              {filtered.filter((m) => m.category === cat).map((m) => {
                const origin = m.variationOfId && molds.find((x) => x.id === m.variationOfId);
                return (
                  <li key={m.id} className="group flex items-center rounded-lg hover:bg-navy-soft">
                    <button type="button" onClick={() => onPick(m)} className="min-w-0 flex-1 px-2.5 py-2 text-left">
                      <span className="block text-sm font-bold">{m.name}</span>
                      {(origin || m.models) && <span className="block text-[11px] text-muted">{origin ? `variação de ${origin.name}` : `${m.models?.length} modelos · ${m.gridIds?.length} grades de tamanho`}</span>}
                    </button>
                    <button
                      type="button" onClick={() => askDelete(m)} aria-label={`Excluir ${m.name}`} title="Excluir molde"
                      className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted hover:bg-crimson-soft hover:text-crimson-ink focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    ><Trash2 size={15} /></button>
                  </li>
                );
              })}
              {!filtered.some((m) => m.category === cat) && <li className="px-2.5 py-2 text-xs text-muted">{CATEGORY_LABEL[cat]}: nenhum resultado</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-cream-2 px-5 py-3 text-xs">
        <button type="button" onClick={onCreate} className="flex items-center gap-1.5 py-2.5 text-sm font-bold text-crimson-ink"><Plus size={15} />Cadastrar novo tipo de produto</button>
        <span className="text-muted">Não encontrou o molde? Cadastre sem sair do pedido.</span>
      </div>

      {toDelete && (
        <ConfirmDialog
          title={`Excluir "${toDelete.name}"?`} confirmLabel="Excluir molde" cancelLabel="Cancelar" busy={deleting || inUseIds.includes(toDelete.id)}
          onConfirm={confirmDelete} onCancel={() => setToDelete(null)}
        >
          O tipo de produto sai do catálogo e não poderá mais ser escolhido em novos pedidos. Moldes já usados em pedidos ou que têm variações não podem ser excluídos.
          {deleteError && <p role="alert" className="mt-3 rounded-lg bg-crimson-soft p-3 text-sm font-bold text-crimson-ink">{deleteError}</p>}
        </ConfirmDialog>
      )}
    </div>
  );
}
