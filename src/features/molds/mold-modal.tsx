"use client";

import { Check, ChevronDown, Pencil, Plus, TriangleAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORY_LABEL, categoryIcon, PIECE_LABEL, pieceIcon } from "./category";
import { Button, Checkbox, ConfirmDialog, cx, Field, Input, Segmented, Select, useToast } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import type { Mold, MoldCategory, PieceType, SizeGrid } from "@/lib/types";

const SLEEVES = ["Curta", "3/4", "Longa", "Gola-polo", "Raglan", "Camisa básica"];
const PIECES = Object.keys(PIECE_LABEL) as PieceType[];
const EXAMPLE: Record<MoldCategory, string> = {
  BLUSA: "Ex.: Camiseta Básica, Regata, Calça, Macacão",
  ESTOJO_BOLSA: "Ex.: Estojo 10, Estojo 12, Necessaire Make, Bolsinha",
  OUTRO: "",
};

/** Seleção múltipla com busca: digite para filtrar a lista ou criar uma propriedade nova. */
function PropertyPicker({ value, onChange, options }: { value: string[]; onChange: (v: string[]) => void; options: string[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const t = q.trim();
  const matches = options.filter((o) => !value.includes(o) && o.toLowerCase().includes(t.toLowerCase()));
  const canCreate = !!t && ![...options, ...value].some((o) => o.toLowerCase() === t.toLowerCase());
  const add = (v: string) => { onChange([...value, v]); setQ(""); };

  return (
    <div className="relative">
      <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-slate/70 bg-surface px-3 py-2 focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/25">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-navy py-1 pl-2.5 pr-1.5 text-[13px] font-bold text-white">
            {v}<button type="button" aria-label={`Remover ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}><X size={14} /></button>
          </span>
        ))}
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (matches[0] && !canCreate) add(matches[0]); else if (canCreate) add(t); } }}
          aria-label="Propriedades do molde" placeholder="Digite para buscar ou criar…"
          className="min-w-32 flex-1 bg-transparent py-0.5 text-[15px] font-semibold outline-none placeholder:font-normal placeholder:text-muted" />
        <ChevronDown size={18} className="shrink-0 text-ink" aria-hidden />
      </div>
      {open && (matches.length > 0 || canCreate) && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-lg">
          {matches.map((o) => <li key={o}><button type="button" onMouseDown={(e) => { e.preventDefault(); add(o); }} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-navy-soft/60">{o}</button></li>)}
          {canCreate && <li><button type="button" onMouseDown={(e) => { e.preventDefault(); add(t); }} className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm font-bold text-crimson-ink hover:bg-crimson-soft"><Plus size={14} />Criar “{t}”</button></li>}
        </ul>
      )}
    </div>
  );
}

/** Lista de tamanhos editável (chips com remover + campo para adicionar). */
function SizeChips({ sizes, input, onChange }: { sizes: string[]; input: string; onChange: (s: string[], input: string) => void }) {
  const add = () => { const v = input.trim(); if (v) onChange(sizes.includes(v) ? sizes : [...sizes, v], ""); };
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {sizes.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-md bg-navy-soft py-1 pl-2 pr-1 text-xs font-bold">
            {s}<button type="button" aria-label={`Remover tamanho ${s}`} onClick={() => onChange(sizes.filter((x) => x !== s), input)} className="grid h-5 w-5 place-items-center rounded text-muted hover:text-crimson-ink"><X size={12} /></button>
          </span>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <Input value={input} onChange={(e) => onChange(sizes, e.target.value)} placeholder="Novo tamanho (ex.: EXG)" className="py-2" aria-label="Novo tamanho" />
        <Button variant="outline" className="py-2" onClick={add}>Adicionar</Button>
      </form>
    </>
  );
}

export function MoldModal({ molds, grids, onClose, onSaved }: {
  molds: Mold[]; grids: SizeGrid[]; onClose: () => void; onSaved: (m: Mold, addToOrder: boolean) => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const [category, setCategory] = useState<MoldCategory>("BLUSA");
  const [pieceType, setPieceType] = useState<PieceType>("CIMA");
  const [name, setName] = useState("");
  const [sleeve, setSleeve] = useState(SLEEVES[0]);
  const [noSleeve, setNoSleeve] = useState(false);
  const [properties, setProperties] = useState<string[]>([]);
  const [gridIds, setGridIds] = useState<string[]>(grids.map((g) => g.id));
  const [isVariation, setIsVariation] = useState(false);
  const [variationOfId, setVariationOfId] = useState("");
  const [group, setGroup] = useState("");
  const [hasSizes, setHasSizes] = useState(false);
  const [notes, setNotes] = useState("");
  const [size, setSize] = useState("");
  const [model, setModel] = useState("");
  // Estojo/bolsa: marcado = o valor é guardado no molde e passa a ser sugerido nos próximos cadastros
  const [keepSize, setKeepSize] = useState(true);
  const [keepModel, setKeepModel] = useState(true);
  const [gridEdit, setGridEdit] = useState<{ id: string; sizes: string[]; input: string } | null>(null);
  const [gridNew, setGridNew] = useState<{ name: string; description: string; sizes: string[]; input: string } | null>(null);
  const [gridBusy, setGridBusy] = useState(false);
  const [confirm, setConfirm] = useState<boolean | null>(null); // null = fechado; boolean = "adicionar ao pedido"
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const confirmOpen = confirm !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !confirmOpen && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, confirmOpen]);

  const vest = category === "BLUSA";
  const origins = molds.filter((m) => m.category === category);
  const groups = [...new Set(molds.map((m) => m.group).filter(Boolean))] as string[];
  const estojos = molds.filter((m) => m.category === "ESTOJO_BOLSA");
  const sizeOptions = [...new Set(estojos.map((m) => m.size).filter(Boolean))] as string[];
  const modelOptions = [...new Set(estojos.flatMap((m) => m.models ?? []))];
  const propertyOptions = [...new Set(molds.flatMap((m) => m.properties ?? []))];
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  function review(addToOrder: boolean) {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Informe o nome do molde");
    if (isVariation && !variationOfId) errs.push("Escolha de qual modelo este é uma variação");
    if (vest && !gridIds.length) errs.push("Selecione ao menos uma grade de tamanho");
    if (errs.length) return setErrors(errs);
    setErrors([]);
    setConfirm(addToOrder);
  }

  async function save(addToOrder: boolean) {
    setSaving(true); setErrors([]);
    try {
      const mold = await api.molds.create({
        category, name: name.trim(), notes: notes.trim() || undefined,
        variationOfId: isVariation ? variationOfId : undefined,
        ...(vest ? { pieceType, gridIds, properties, models: noSleeve ? [] : [sleeve, ...SLEEVES.filter((s) => s !== sleeve)] } : {}),
        ...(category === "ESTOJO_BOLSA" ? { size: keepSize ? size.trim() || undefined : undefined, models: keepModel && model.trim() ? [model.trim()] : undefined } : {}),
        ...(category === "OUTRO" ? { group: group.trim() || undefined, hasSizes } : {}),
      });
      toast.success("Molde cadastrado com sucesso", mold.name);
      onSaved(mold, addToOrder);
    } catch (e) {
      setConfirm(null);
      setErrors(e instanceof ApiError ? e.messages : ["Não foi possível salvar o molde"]);
    } finally { setSaving(false); }
  }

  const openGrid = (id: string) => { setGridNew(null); setGridEdit({ id, sizes: [...(grids.find((g) => g.id === id)?.sizes ?? [])], input: "" }); };
  async function saveGrid() {
    setGridBusy(true); setErrors([]);
    try {
      if (gridEdit) {
        await api.updateGrid(gridEdit.id, gridEdit.sizes);
        toast.success("Tamanhos da grade atualizados", grids.find((g) => g.id === gridEdit.id)?.name);
        setGridEdit(null);
      } else if (gridNew) {
        const g = await api.createGrid({ name: gridNew.name, description: gridNew.description, sizes: gridNew.sizes });
        toast.success("Categoria de tamanho criada", g.name);
        setGridIds((ids) => [...ids, g.id]);
        setGridNew(null);
      }
      router.refresh();
    } catch (e) { setErrors(e instanceof ApiError ? e.messages : ["Não foi possível salvar a grade"]); }
    finally { setGridBusy(false); }
  }

  const summary = vest ? `${PIECE_LABEL[pieceType]} · ${noSleeve ? "sem manga" : `manga ${sleeve.toLowerCase()}`}` : CATEGORY_LABEL[category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-3 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="mold-title" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">
        <div className="overflow-y-auto px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 id="mold-title" className="text-2xl font-extrabold sm:text-3xl">{vest ? "Novo molde" : "Novo tipo de produto"}</h2>
              <p className="mt-1 text-sm text-muted">Use o nome como o molde é intitulado na produção.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Fechar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream hover:bg-navy-soft"><X size={18} /></button>
          </div>

          <div className="mb-1.5 text-sm font-extrabold">Categoria<span className="text-crimson-ink">*</span></div>
          <div>
            <Segmented<MoldCategory> fill value={category} onChange={(c) => { setCategory(c); setVariationOfId(""); }}
              options={(Object.keys(CATEGORY_LABEL) as MoldCategory[]).map((c) => ({ value: c, label: CATEGORY_LABEL[c], icon: categoryIcon(c) }))} />
          </div>

          {vest && (
            <>
              <div className="mb-1.5 mt-5 text-sm font-extrabold">Tipo de peça<span className="text-crimson-ink">*</span></div>
              <Segmented<PieceType> fill value={pieceType} onChange={setPieceType}
                options={PIECES.map((p) => ({ value: p, label: PIECE_LABEL[p], icon: pieceIcon(p) }))} />
            </>
          )}

          {category === "OUTRO" && (
            <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-navy-soft p-3.5 text-sm font-semibold"><TriangleAlert size={16} className="mt-0.5 shrink-0" />Para produtos fora de vestuário, estojos e bolsas: mochila, mochila de lona, capa para violão, bolsa para gabinete…</p>
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

          {category === "ESTOJO_BOLSA" && (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Field label="Tamanho (opcional)" hint="Insira as dimensões ou selecione da lista.">
                  <Input list="mold-sizes" value={size} onChange={(e) => setSize(e.target.value)} placeholder="Ex.: 6 Altura x 26 Comprimento" />
                  <datalist id="mold-sizes">{sizeOptions.map((o) => <option key={o} value={o} />)}</datalist>
                </Field>
                <Checkbox checked={keepSize} onChange={setKeepSize}>Incorporar nova dimensão à lista.</Checkbox>
              </div>
              <div className="space-y-3">
                <Field label="Modelo (opcional)" hint="Especifique se houver um modelo ou selecione da lista.">
                  <Input list="mold-models" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex.: Escolar" />
                  <datalist id="mold-models">{modelOptions.map((o) => <option key={o} value={o} />)}</datalist>
                </Field>
                <Checkbox checked={keepModel} onChange={setKeepModel}>Incorporar novo modelo à lista.</Checkbox>
              </div>
            </div>
          )}

          {vest && (
            <>
              <div className="mt-5 text-sm font-extrabold">Manga padrão <span className="text-crimson-ink">*</span> <span className="text-xs font-normal text-muted">escolhida automaticamente no pedido, mas pode ser alterada</span></div>
              <div className={cx("mt-2.5 flex flex-wrap gap-2", noSleeve && "opacity-50")}>
                {SLEEVES.map((m) => (
                  <button key={m} type="button" disabled={noSleeve} aria-pressed={!noSleeve && sleeve === m} onClick={() => setSleeve(m)}
                    className={cx("flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold", !noSleeve && sleeve === m ? "border-navy bg-navy text-white" : "border-slate bg-surface")}>
                    {!noSleeve && sleeve === m && <Check size={14} />}{m}
                  </button>
                ))}
              </div>
              <div className="mt-3"><Checkbox checked={noSleeve} onChange={setNoSleeve}>Este molde não tem manga (ex.: Regata, Camiseta Machão)</Checkbox></div>

              <div className="mt-5 text-sm font-extrabold">Propriedades do molde <span className="text-xs font-normal text-muted">características padrão do molde</span></div>
              <div className="mt-2"><PropertyPicker value={properties} onChange={setProperties} options={propertyOptions} /></div>
              <p className="mt-1.5 text-xs text-muted">Ao digitar, abre a lista de propriedades com busca e a opção de criar uma nova.</p>

              <div className="mt-6 text-sm font-extrabold">Grades de tamanho <span className="text-crimson-ink">*</span> <span className="text-xs font-normal text-muted">o pedido mostrará só as grades marcadas</span></div>
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

              {gridEdit && (
                <div className="mt-3 rounded-xl border border-line bg-cream-2 p-4">
                  <Field label="Grade">
                    <Select value={gridEdit.id} onChange={(e) => openGrid(e.target.value)}>{grids.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select>
                  </Field>
                  <SizeChips sizes={gridEdit.sizes} input={gridEdit.input} onChange={(sizes, input) => setGridEdit({ ...gridEdit, sizes, input })} />
                  <div className="mt-4 flex gap-3">
                    <Button disabled={gridBusy || !gridEdit.sizes.length} onClick={saveGrid}>Salvar tamanhos</Button>
                    <Button variant="ghost" onClick={() => setGridEdit(null)}>Cancelar</Button>
                  </div>
                </div>
              )}
              {gridNew && (
                <div className="mt-3 rounded-xl border border-line bg-cream-2 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome da categoria" required><Input value={gridNew.name} onChange={(e) => setGridNew({ ...gridNew, name: e.target.value })} placeholder="Ex.: Juvenil" autoFocus /></Field>
                    <Field label="Descrição" hint="Opcional"><Input value={gridNew.description} onChange={(e) => setGridNew({ ...gridNew, description: e.target.value })} placeholder="Ex.: 10 a 16 anos" /></Field>
                  </div>
                  <SizeChips sizes={gridNew.sizes} input={gridNew.input} onChange={(sizes, input) => setGridNew({ ...gridNew, sizes, input })} />
                  <div className="mt-4 flex gap-3">
                    <Button disabled={gridBusy || !gridNew.name.trim() || !gridNew.sizes.length} onClick={saveGrid}>Criar categoria</Button>
                    <Button variant="ghost" onClick={() => setGridNew(null)}>Cancelar</Button>
                  </div>
                </div>
              )}
              {!gridEdit && !gridNew && (
                <>
                  <button type="button" onClick={() => grids[0] && openGrid(grids[0].id)} className="mt-3 flex items-center gap-1.5 py-2.5 text-sm font-bold text-crimson-ink"><Pencil size={14} />Editar ou adicionar tamanhos de uma grade</button>
                  <button type="button" onClick={() => setGridNew({ name: "", description: "", sizes: [], input: "" })} className="flex items-center gap-1.5 py-2.5 text-sm font-bold text-crimson-ink"><Plus size={14} />Criar nova categoria de tamanho</button>
                </>
              )}
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

          {!vest && (
            <Field label={category === "OUTRO" ? "Observações do molde" : "Mais informações (opcional)"} className="mt-5">
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={category === "OUTRO" ? "Medidas, material, acabamento… (opcional)" : "Medidas, zíper, forro…"} />
            </Field>
          )}

          {errors.length > 0 && <ul role="alert" className="mt-5 space-y-1 rounded-xl bg-crimson-soft p-3.5 text-sm font-semibold text-crimson-ink">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-line bg-cream-2 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:px-8 sm:py-5">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>Cancelar</Button>
          <Button variant="outline" className="w-full sm:w-auto" disabled={saving} onClick={() => review(false)}>Salvar</Button>
          <Button className="w-full sm:w-auto" disabled={saving} onClick={() => review(true)}><Check size={16} />Salvar e adicionar ao pedido</Button>
        </div>
      </div>

      {confirm !== null && (
        <ConfirmDialog title="Criar novo molde?" confirmLabel="Criar molde" cancelLabel="Voltar e revisar" busy={saving}
          onConfirm={() => save(confirm)} onCancel={() => setConfirm(null)}>
          O molde “{name.trim()}” ({summary}) será salvo e ficará disponível imediatamente para todos os pedidos.
        </ConfirmDialog>
      )}
    </div>
  );
}
