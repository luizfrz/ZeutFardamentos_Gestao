"use client";

import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import { cx, Field, Input, Select } from "@/components/ui";
import type { Mold, SizeGrid } from "@/lib/types";
import { categoryIcon, CATEGORY_LABEL } from "@/features/molds/category";

export interface DraftItem {
  key: string;
  moldId: string;
  model: string;
  color: string;
  open: boolean;
  grids: { gridId: string; quantities: Record<string, string> }[];
  quantity: number;
}

export const usesGrid = (m?: Mold) => !!m?.gridIds?.length;
export const subtotal = (q: Record<string, string>) => Object.values(q).reduce((s, v) => s + (parseInt(v) || 0), 0);
export const itemPieces = (it: DraftItem, mold?: Mold) =>
  usesGrid(mold) ? it.grids.reduce((s, g) => s + subtotal(g.quantities), 0) : it.quantity;

export function ProductCard({ item, mold, molds, grids, onChange, onRemove }: {
  item: DraftItem; mold?: Mold; molds: Mold[]; grids: SizeGrid[];
  onChange: (patch: Partial<DraftItem>) => void; onRemove: () => void;
}) {
  if (!mold) return null;
  const pieces = itemPieces(item, mold);
  const origin = mold.variationOfId ? molds.find((m) => m.id === mold.variationOfId) : undefined;
  const sameCategory = molds.filter((m) => m.category === mold.category);
  const gridMode = usesGrid(mold);
  const available = grids.filter((g) => mold.gridIds?.includes(g.id));
  const freeGrids = available.filter((g) => !item.grids.some((x) => x.gridId === g.id));

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-cream-2 px-3 py-3 sm:px-4 sm:py-3.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-crimson-soft text-crimson-ink">{categoryIcon(mold.category, 18)}</span>
        <button type="button" onClick={() => onChange({ open: !item.open })} aria-expanded={item.open} className="flex min-w-[9rem] flex-1 flex-col items-start text-left">
          <span className="font-extrabold">{mold.name}</span>
          <span className="mt-1 flex flex-wrap gap-1.5">
            {[item.model, gridMode ? item.color : CATEGORY_LABEL[mold.category]].filter(Boolean).map((t) => (
              <span key={t} className="rounded-full bg-navy-soft px-2.5 py-0.5 text-[11px] font-bold">{t}</span>
            ))}
            {origin && <span className="rounded-full bg-crimson-soft px-2.5 py-0.5 text-[11px] font-bold text-crimson-ink">Variação de {origin.name}</span>}
          </span>
        </button>
        <span className="ml-auto shrink-0 rounded-full bg-navy px-3 py-1 text-[11px] font-extrabold text-white">{pieces} {pieces === 1 ? "PEÇA" : "PEÇAS"}</span>
        <button type="button" onClick={onRemove} aria-label={`Remover ${mold.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted hover:text-crimson-ink"><Trash2 size={18} /></button>
        <button type="button" onClick={() => onChange({ open: !item.open })} aria-label="Expandir" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted"><ChevronDown size={18} className={cx("transition-transform", item.open && "rotate-180")} /></button>
      </div>

      {item.open && (
        <div className="space-y-5 p-5">
          <div className={cx("grid gap-4", gridMode ? "md:grid-cols-3" : "md:grid-cols-[1fr_1fr_auto]")}>
            <Field label="Molde" required>
              <Select value={mold.id} onChange={(e) => {
                const next = molds.find((m) => m.id === e.target.value);
                onChange({ moldId: e.target.value, model: next?.models?.[0] ?? "", grids: [] });
              }}>
                {sameCategory.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </Field>
            {gridMode && mold.models?.length ? (
              <Field label="Manga" required hint="Padrão do molde; pode ser alterada neste pedido">
                <Select value={item.model} onChange={(e) => onChange({ model: e.target.value })}>
                  {mold.models.map((m) => <option key={m}>{m}</option>)}
                </Select>
              </Field>
            ) : null}
            <Field label={gridMode ? "Cor / tecido" : "Cor / estampa"} required>
              <Input value={item.color} onChange={(e) => onChange({ color: e.target.value })} placeholder={gridMode ? "Ex.: Azul-marinho · malha PV" : "Ex.: Vermelho com logo bordado"} />
            </Field>
            {!gridMode && (
              <Field label="Quantidade" required>
                <div className="flex overflow-hidden rounded-xl border border-slate/70">
                  <button type="button" aria-label="Diminuir" onClick={() => onChange({ quantity: Math.max(0, item.quantity - 1) })} className="px-3.5 hover:bg-navy-soft"><Minus size={16} /></button>
                  <input type="number" min={0} aria-label="Quantidade" value={item.quantity} onChange={(e) => onChange({ quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-16 border-x border-slate/70 py-3 text-center font-extrabold outline-none" />
                  <button type="button" aria-label="Aumentar" onClick={() => onChange({ quantity: item.quantity + 1 })} className="px-3.5 hover:bg-navy-soft"><Plus size={16} /></button>
                </div>
              </Field>
            )}
          </div>

          {gridMode && (
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-extrabold">Quantidade por tamanho <span className="text-crimson-ink">*</span></span>
                <span className="text-xs text-muted">Preencha apenas os tamanhos encomendados</span>
              </div>
              <div className="space-y-3">
                {item.grids.map((g) => {
                  const def = grids.find((x) => x.id === g.gridId);
                  if (!def) return null;
                  return (
                    <div key={g.gridId} className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border border-line bg-cream-2 p-3.5">
                      <div className="w-full sm:w-24 sm:shrink-0"><div className="text-sm font-extrabold">{def.name}</div><div className="text-[11px] text-muted">{def.description}</div></div>
                      <div className="flex flex-1 flex-wrap gap-2">
                        {def.sizes.map((s) => (
                          <label key={s} className="block text-center">
                            <span className="mb-1 block text-[11px] font-semibold text-muted">{s}</span>
                            <input type="number" min={0} inputMode="numeric" value={g.quantities[s] ?? ""} placeholder="0"
                              onChange={(e) => onChange({ grids: item.grids.map((x) => x.gridId === g.gridId ? { ...x, quantities: { ...x.quantities, [s]: e.target.value } } : x) })}
                              className="h-10 w-12 rounded-lg border border-slate/70 bg-surface text-center text-[15px] font-extrabold outline-none placeholder:text-slate focus:border-navy focus:ring-2 focus:ring-navy/25" />
                          </label>
                        ))}
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        <div className="text-right"><div className="text-[11px] font-semibold text-muted">Subtotal</div><div className="font-extrabold">{subtotal(g.quantities)}</div></div>
                        <button type="button" aria-label={`Remover grade ${def.name}`} onClick={() => onChange({ grids: item.grids.filter((x) => x.gridId !== g.gridId) })} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted hover:text-crimson-ink"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {freeGrids.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-semibold text-muted">Adicionar grade:</span>
                  {freeGrids.map((g) => (
                    <button key={g.id} type="button" onClick={() => onChange({ grids: [...item.grids, { gridId: g.id, quantities: {} }] })}
                      className="rounded-full border border-navy bg-surface px-3.5 py-1.5 text-sm font-bold hover:bg-navy-soft/60">+ {g.name} ({g.description})</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
