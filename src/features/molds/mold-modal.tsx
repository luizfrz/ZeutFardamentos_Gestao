"use client";

import { Check, Pencil, Plus, TriangleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORY_LABEL, categoryIcon } from "./category";
import { Button, Checkbox, cx, Field, Input, Segmented, Select, useToast } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import type { Mold, MoldCategory, SizeGrid } from "@/lib/types";

const DEFAULT_MODELS = ["Gola polo", "Raglan", "Manga longa", "Manga 3/4"];
const EXAMPLE: Record<MoldCategory, string> = {
  BLUSA: "Ex.: Blusa, Blusa escolar, Blusa feminina",
  ESTOJO_BOLSA: "Ex.: Estojo 10, Estojo 12, Necessaire Make, Bolsinha",
  OUTRO: "",
};
export function MoldModal({ molds, grids, onClose, onSaved }: {
  molds: Mold[]; grids: SizeGrid[]; onClose: () => void; onSaved: (m: Mold) => void;
}) {
  const toast = useToast();
  const [category, setCategory] = useState<MoldCategory>("BLUSA");
  const [name, setName] = useState("");
  const [models, setModels] = useState<string[]>(DEFAULT_MODELS);
  const [allModels, setAllModels] = useState<string[]>(DEFAULT_MODELS);
  const [newModel, setNewModel] = useState<string | null>(null);
  const [gridIds, setGridIds] = useState<string[]>(grids.map((g) => g.id));
  const [isVariation, setIsVariation] = useState(false);
  const [variationOfId, setVariationOfId] = useState("");
  const [group, setGroup] = useState("");
  const [hasSizes, setHasSizes] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const origins = molds.filter((m) => m.category === category);
  const groups = [...new Set(molds.map((m) => m.group).filter(Boolean))] as string[];
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function save() {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Informe o nome do molde");
    if (isVariation && !variationOfId) errs.push("Escolha de qual modelo este é uma variação");
    if (category === "BLUSA" && !models.length) errs.push("Selecione ao menos um modelo");
    if (category === "BLUSA" && !gridIds.length) errs.push("Selecione ao menos uma grade de tamanho");
    if (errs.length) return setErrors(errs);
    setSaving(true); setErrors([]);
    try {
      const mold = await api.molds.create({
        category, name: name.trim(), notes: notes.trim() || undefined,
        variationOfId: isVariation ? variationOfId : undefined,
        ...(category === "BLUSA" ? { models, gridIds } : {}),
        ...(category === "OUTRO" ? { group: group.trim() || undefined, hasSizes } : {}),
      });
      toast.success("Molde cadastrado com sucesso", mold.name);
      onSaved(mold);
    } catch (e) {
      setErrors(e instanceof ApiError ? e.messages : ["Não foi possível salvar o molde"]);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-3 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="mold-title" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">
        <div className="overflow-y-auto px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 id="mold-title" className="text-2xl font-extrabold sm:text-3xl">Novo tipo de produto</h2>
              <p className="mt-1 text-sm text-muted">Use o nome como o molde é intitulado na produção.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Fechar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream hover:bg-navy-soft"><X size={18} /></button>
          </div>

          <div className="mb-1.5 text-sm font-extrabold">Categoria<span className="text-crimson-ink">*</span></div>
          <div>
            <Segmented<MoldCategory> fill value={category} onChange={(c) => { setCategory(c); setVariationOfId(""); }}
              options={(Object.keys(CATEGORY_LABEL) as MoldCategory[]).map((c) => ({ value: c, label: CATEGORY_LABEL[c], icon: categoryIcon(c) }))} />
          </div>

          {category === "OUTRO" && (
            <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-navy-soft p-3.5 text-sm font-semibold"><TriangleAlert size={16} className="mt-0.5 shrink-0" />Para produtos fora de blusas, estojos e bolsas: mochila, mochila de lona, capa para violão, bolsa para gabinete…</p>
          )}

          <div className={cx("mt-5 grid gap-5", category === "OUTRO" && "md:grid-cols-2")}>
            <Field label="Nome do molde" required hint={EXAMPLE[category] || undefined}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={category === "OUTRO" ? "Ex.: Mochila de lona" : undefined} autoFocus />
            </Field>
            {category === "OUTRO" && (
              <Field label="Grupo no catálogo" hint="Opcional — ajuda a organizar a busca">
                <Input list="mold-groups" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Ex.: Mochilas, Capas" />
                <datalist id="mold-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
              </Field>
            )}
          </div>

          {category === "BLUSA" && (
            <>
              <div className="mt-5 text-sm font-extrabold">Modelos disponíveis <span className="text-crimson-ink">*</span> <span className="font-normal text-muted">selecione um ou mais</span></div>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {allModels.map((m) => (
                  <button key={m} type="button" aria-pressed={models.includes(m)} onClick={() => setModels(toggle(models, m))}
                    className={cx("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold", models.includes(m) ? "bg-navy text-white" : "border border-slate bg-surface")}>
                    {models.includes(m) && <Check size={14} />}{m}
                  </button>
                ))}
              </div>
              {newModel === null ? (
                <button type="button" onClick={() => setNewModel("")} className="mt-1 flex items-center gap-1.5 py-2.5 text-sm font-bold text-crimson-ink"><Plus size={16} />Novo modelo</button>
              ) : (
                <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = newModel.trim(); if (v && !allModels.includes(v)) { setAllModels([...allModels, v]); setModels([...models, v]); } setNewModel(null); }}>
                  <Input value={newModel} onChange={(e) => setNewModel(e.target.value)} placeholder="Nome do modelo" autoFocus className="py-2" />
                  <Button variant="outline" className="py-2" onClick={() => { const v = newModel.trim(); if (v && !allModels.includes(v)) { setAllModels([...allModels, v]); setModels([...models, v]); } setNewModel(null); }}>Adicionar</Button>
                </form>
              )}

              <div className="mt-6 text-sm font-extrabold">Grades de tamanho <span className="text-crimson-ink">*</span> <span className="font-normal text-muted">o pedido mostrará só as grades marcadas</span></div>
              <div className="mt-2.5 space-y-3">
                {grids.map((g) => (
                  <div key={g.id} className={cx("rounded-xl border-2 p-3.5", gridIds.includes(g.id) ? "border-navy" : "border-line")}>
                    <div className="flex items-center justify-between gap-3">
                      <Checkbox checked={gridIds.includes(g.id)} onChange={() => setGridIds(toggle(gridIds, g.id))}><span className="font-extrabold">{g.name}</span></Checkbox>
                      <span className="text-xs text-muted">{g.description}</span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">{g.sizes.map((s) => <span key={s} className="rounded-md bg-navy-soft px-2 py-1 text-[11px] font-bold">{s}</span>)}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-crimson-ink"><Pencil size={14} />Os tamanhos de cada grade são definidos no catálogo de grades</p>
            </>
          )}

          {category === "OUTRO" && (
            <div className="mt-5"><Checkbox checked={hasSizes} onChange={setHasSizes}>Este produto tem tamanhos (ex.: P, M, G ou infantil/adulto)</Checkbox></div>
          )}

          <div className="mt-5"><Checkbox checked={isVariation} onChange={setIsVariation}>Este modelo é uma variação de outro modelo</Checkbox></div>
          {isVariation && (
            <div className="mt-4 rounded-xl border border-amber/40 bg-cream-2 p-4">
              <Field label="Variação de qual modelo?" required hint="A variação aparece agrupada com o modelo de origem no catálogo e nos relatórios.">
                <Select value={variationOfId} onChange={(e) => setVariationOfId(e.target.value)}>
                  <option value="">Selecione…</option>
                  {origins.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
              </Field>
            </div>
          )}

          {category !== "BLUSA" && (
            <Field label="Observações do molde" className="mt-5">
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={category === "OUTRO" ? "Medidas, material, acabamento… (opcional)" : "Medidas, zíper, forro… (opcional)"} />
            </Field>
          )}

          {errors.length > 0 && <ul role="alert" className="mt-5 space-y-1 rounded-xl bg-crimson-soft p-3.5 text-sm font-semibold text-crimson-ink">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-line bg-cream-2 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:px-8 sm:py-5">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>Cancelar</Button>
          <Button className="w-full sm:w-auto" disabled={saving} onClick={save}><Check size={16} />Salvar e adicionar ao pedido</Button>
        </div>
      </div>
    </div>
  );
}
