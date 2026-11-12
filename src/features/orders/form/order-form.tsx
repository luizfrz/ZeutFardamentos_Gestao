"use client";

import { Link2, Plus, TriangleAlert, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button, Card, ChecklistItem, ConfirmDialog, cx, Field, Input, StepTitle, Textarea, PriorityBadge, useToast } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { daysUntil, formatBRL, formatDate, maskBRL, parseBRL, piecesLabel } from "@/lib/format";
import { uploadImage } from "@/lib/image";
import { classifyDeadline, computePriority } from "@/lib/priority";
import type { Client, Mold, Order, Responsible, SizeGrid } from "@/lib/types";
import { MoldModal } from "@/features/molds/mold-modal";
import { ClientSummary } from "./client-summary";
import { PersonPicker } from "./person-picker";
import { PhotoSlider } from "./photo-slider";
import { type DraftItem, itemPieces, ProductCard, usesGrid } from "./product-card";
import { ProductPicker } from "./product-picker";

let seq = 0;
const MAX_IMAGES = 8;
const key = () => `i${++seq}`;
const DEADLINE_TONE = { danger: "text-crimson-ink", warn: "text-crimson-ink", info: "text-muted", ok: "text-ok-ink" } as const;

function toDraft(it: NonNullable<Order["items"]>[number]): DraftItem {
  return {
    key: key(), moldId: it.moldId, model: it.model ?? "", color: it.color, open: false, quantity: it.quantity ?? 0,
    grids: (it.grids ?? []).map((g) => ({ gridId: g.gridId, quantities: Object.fromEntries(Object.entries(g.quantities).map(([k, v]) => [k, String(v)])) })),
  };
}

export function OrderForm({ molds, grids, clients, responsibles, initial, presetClientId, presetResponsibleId }: {
  molds: Mold[]; grids: SizeGrid[]; clients: Client[]; responsibles: Responsible[]; initial?: Order;
  presetClientId?: string | null; presetResponsibleId?: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [allMolds, setAllMolds] = useState(molds);
  const [clientId, setClientId] = useState<string | null>(initial?.clientId ?? presetClientId ?? null);
  const [responsibleId, setResponsibleId] = useState<string | null>(initial?.responsibleId ?? presetResponsibleId ?? null);
  const selectedClient = clients.find((c) => c.id === clientId);

  const [items, setItems] = useState<DraftItem[]>(() => initial?.items.map(toDraft) ?? []);
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(initial?.deliveryDate ?? "");
  const [totalValue, setTotalValue] = useState(maskBRL(String(initial?.totalValue ?? "")));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [links, setLinks] = useState<string[]>(initial?.links.length ? initial.links.map((l) => l.url) : [""]);
  const [files, setFiles] = useState<File[]>([]);
  const [savedImages, setSavedImages] = useState<string[]>(initial?.images ?? []);
  const [picker, setPicker] = useState(false);
  const [modal, setModal] = useState(false);
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmPast, setConfirmPast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Aceita só imagens PNG/JPG/WebP e respeita o limite de fotos por pedido. */
  function addFiles(list: File[]) {
    const ok = list.filter((f) => /^image\/(png|jpeg|webp)$/.test(f.type));
    setFiles((cur) => [...cur, ...ok].slice(0, Math.max(0, MAX_IMAGES - savedImages.length)));
  }

  const moldOf = (id: string) => allMolds.find((m) => m.id === id);
  const patch = (k: string, p: Partial<DraftItem>) => setItems((xs) => xs.map((x) => (x.key === k ? { ...x, ...p } : x)));

  function addMold(m: Mold) {
    const defaultGrid = m.gridIds?.includes("g-unissex") ? "g-unissex" : m.gridIds?.[0];
    setItems((xs) => [...xs, {
      key: key(), moldId: m.id, model: m.models?.[0] ?? "", color: "", open: true, quantity: 0,
      grids: usesGrid(m) && defaultGrid ? [{ gridId: defaultGrid, quantities: {} }] : [],
    }]);
    setPicker(false);
  }

  const total = items.reduce((s, it) => s + itemPieces(it, moldOf(it.moldId)), 0);
  const daysLeft = date ? daysUntil(date) : null;
  const priority = daysLeft === null ? null : computePriority(daysLeft);
  const deadline = daysLeft === null ? null : classifyDeadline(daysLeft);
  // Em edição, uma data passada que não foi alterada não precisa de nova confirmação.
  const needsPastConfirm = !!deadline?.past && !(initial && date === initial.deliveryDate);

  const checks = {
    client: !!clientId, responsible: !!responsibleId, name: !!name.trim(), date: !!date, products: items.length > 0 && total > 0,
  };
  const valid = Object.values(checks).every(Boolean);
  const firstMissing = !checks.client ? "Vincule um cliente" : !checks.responsible ? "Vincule um responsável" : !checks.name ? "Preencha o nome do pedido" : !checks.date ? "Informe a data de entrega" : !checks.products ? "Adicione produtos com quantidade" : "";

  function requestSave() {
    setTouched(true);
    if (!valid) return;
    if (needsPastConfirm) return setConfirmPast(true);
    void save(false);
  }

  async function save(allowPastDate: boolean) {
    setConfirmPast(false);
    setSaving(true); setErrors([]);
    let uploaded: string[];
    try {
      uploaded = await Promise.all(files.map(uploadImage));
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Não foi possível enviar as imagens."]);
      toast.error("Não foi possível enviar as fotos", "O pedido não foi salvo. Tente novamente.");
      setSaving(false);
      return;
    }
    const body = {
      name: name.trim(), description: description.trim() || undefined, clientId, responsibleId, deliveryDate: date, totalValue: parseBRL(totalValue),
      items: items.filter((it) => itemPieces(it, moldOf(it.moldId)) > 0).map((it) => {
        const m = moldOf(it.moldId);
        return usesGrid(m)
          ? { moldId: it.moldId, model: it.model || undefined, color: it.color, grids: it.grids.map((g) => ({ gridId: g.gridId, quantities: Object.fromEntries(Object.entries(g.quantities).map(([k, v]) => [k, parseInt(v) || 0]).filter(([, v]) => v)) })) }
          : { moldId: it.moldId, color: it.color, quantity: it.quantity };
      }),
      links: links.map((l) => l.trim()).filter(Boolean).map((url) => ({ url: /^https?:\/\//.test(url) ? url : `https://${url}` })),
      images: [...savedImages, ...uploaded],
      ...(allowPastDate ? { allowPastDate: true } : {}),
    };
    try {
      const saved = initial ? await api.orders.update(initial.id, body) : await api.orders.create(body);
      const fotos = uploaded.length ? `${uploaded.length} ${uploaded.length === 1 ? "foto enviada" : "fotos enviadas"} e salvas no pedido.` : undefined;
      toast.success(initial ? "Pedido atualizado com sucesso" : "Pedido cadastrado com sucesso", fotos ?? saved.name);
      router.push(`/orders/${saved.id}`);
      router.refresh();
    } catch (e) {
      setErrors(e instanceof ApiError ? e.messages : ["Não foi possível salvar o pedido"]);
      setSaving(false);
    }
  }

  const nameInvalid = touched && !name.trim();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <Card className="p-7">
          <StepTitle n={1} title="Vínculos" subtitle="Todo pedido precisa de um cliente e de um responsável." />
          <div className="space-y-5">
            <PersonPicker label="Nome do cliente" docLabel="CPF/CNPJ do cliente" value={clientId} onChange={setClientId}
              people={clients.map((c) => ({ id: c.id, name: c.name, document: c.document, org: c.type !== "PF", hint: `${c.document ? `${c.document.length === 14 ? "CNPJ" : "CPF"} ${formatDoc(c.document)} · ` : ""}${c.type === "ORGAO" ? "Órgão público" : c.type === "PJ" ? "Empresa" : "Pessoa física"}` }))}
              onCreate={() => router.push("/register")} createLabel="Cadastrar novo cliente" />
            {selectedClient && <ClientSummary client={selectedClient} />}
            <PersonPicker label="Nome do responsável" docLabel="CPF do responsável" value={responsibleId} onChange={setResponsibleId} allowCnpj={false}
              people={responsibles.map((r) => ({ id: r.id, name: r.name, document: r.cpf }))}
              onCreate={() => router.push("/register?tab=responsible")} createLabel="Cadastrar novo responsável" />
          </div>
        </Card>

        <Card className="p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <StepTitle n={2} title="Produtos do pedido" subtitle="Adicione cada tipo de produto encomendado. Um pedido pode ter vários produtos e modelos." />
            <div className="text-right"><div className="text-3xl font-extrabold leading-none">{total}</div><div className="text-xs text-muted">peças em {items.length} {items.length === 1 ? "produto" : "produtos"}</div></div>
          </div>
          <div className="space-y-4">
            {items.map((it) => (
              <ProductCard key={it.key} item={it} mold={moldOf(it.moldId)} molds={allMolds} grids={grids}
                onChange={(p) => patch(it.key, p)} onRemove={() => setItems((xs) => xs.filter((x) => x.key !== it.key))} />
            ))}
            <button type="button" onClick={() => setPicker((v) => !v)} aria-expanded={picker}
              className={cx("flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-crimson bg-crimson-soft/70 py-4 text-[15px] font-bold text-crimson-ink hover:bg-crimson-soft", touched && !checks.products && "ring-2 ring-crimson")}>
              <Plus size={18} />Adicionar produto
            </button>
            {picker && (
              <ProductPicker molds={allMolds} inUseIds={items.map((i) => i.moldId)} onPick={addMold} onCreate={() => setModal(true)}
                onDeleted={(id) => setAllMolds((l) => l.filter((m) => m.id !== id))} />
            )}
          </div>
        </Card>

        <Card className="p-7">
          <StepTitle n={3} title="Dados do pedido" />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome do pedido" required error={nameInvalid && "Campo obrigatório. Dê um nome para identificar o pedido."}>
              <Input value={name} onChange={(e) => setName(e.target.value)} invalid={nameInvalid} placeholder="Ex.: Uniformes Escola Raio de Sol" />
            </Field>
            <Field label="Data de entrega" required
              hint={deadline && <span className={cx("font-bold", DEADLINE_TONE[deadline.tone])}>{deadline.label}</span>}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} invalid={!!deadline?.past} />
            </Field>
          </div>
          <Field label="Valor total do pedido (R$)" hint={initial && initial.paidTotal > 0 ? `Já pago: ${formatBRL(initial.paidTotal)}` : "Opcional. Permite registrar pagamentos."} className="mt-5 md:w-1/2">
            <Input value={totalValue} inputMode="numeric" placeholder="0,00" onChange={(e) => setTotalValue(maskBRL(e.target.value))} />
          </Field>
          <Field label="Descrição" hint="Opcional" className="mt-5">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do modelo, tecido, cores, bordados, acabamento…" />
          </Field>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-1.5 text-sm font-extrabold">Imagens</div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
              <button type="button" onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
                className="flex h-36 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-crimson/60 bg-crimson-soft/40 text-sm">
                <Upload size={22} className="text-muted" />
                <span>Arraste imagens ou <span className="font-bold text-crimson-ink">escolha arquivos</span></span>
                <span className="text-xs text-muted">PNG, JPG ou WebP · até {MAX_IMAGES} fotos</span>
              </button>
              <PhotoSlider slides={[
                ...savedImages.map((u) => ({ key: u, src: u, label: "Foto já salva", onRemove: () => setSavedImages(savedImages.filter((x) => x !== u)) })),
                ...files.map((f, i) => ({ key: `${f.name}-${f.lastModified}-${f.size}`, file: f, onRemove: () => setFiles(files.filter((_, j) => j !== i)) })),
              ]} />
            </div>
            <div>
              <div className="mb-1.5 text-sm font-extrabold">Links</div>
              <div className="space-y-2.5">
                {links.map((l, i) => (
                  <Input key={i} value={l} icon={<Link2 size={17} />} aria-label={`Link ${i + 1}`} placeholder="Cole um link (arte, planilha…)" onChange={(e) => setLinks(links.map((x, j) => (j === i ? e.target.value : x)))} />
                ))}
              </div>
              <button type="button" onClick={() => setLinks([...links, ""])} className="mt-1 flex items-center gap-1.5 py-2.5 text-sm font-bold text-crimson-ink"><Plus size={16} />Adicionar outro link</button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 lg:sticky lg:top-6">
        <h2 className="mb-4 text-xl font-extrabold">Resumo do pedido</h2>
        <div className={cx("mb-5 rounded-xl p-4", priority === "URGENTE" ? "bg-crimson-soft" : "bg-cream-2")}>
          <div className="mb-2 text-xs font-semibold text-muted">Prioridade calculada</div>
          {priority && daysLeft !== null ? (
            <>
              <PriorityBadge priority={priority} />
              <p className="mt-2.5 text-sm font-semibold">{deadline?.label} com {piecesLabel(total)} em {items.length} {items.length === 1 ? "produto" : "produtos"}.</p>
            </>
          ) : <p className="text-sm font-semibold text-muted">Informe a data de entrega e os produtos para calcular.</p>}
        </div>
        <div className="mb-2 text-sm font-extrabold text-muted">Campos obrigatórios</div>
        <ul className="space-y-3">
          <ChecklistItem ok={checks.client}>Cliente vinculado</ChecklistItem>
          <ChecklistItem ok={checks.responsible}>Responsável vinculado</ChecklistItem>
          <ChecklistItem ok={checks.name}>Nome do pedido</ChecklistItem>
          <ChecklistItem ok={checks.date}>Data de entrega</ChecklistItem>
          <ChecklistItem ok={checks.products}>Produtos{total > 0 && ` (${items.length} · ${piecesLabel(total)})`}</ChecklistItem>
        </ul>
        <div className="mt-5 space-y-3 border-t border-line pt-5">
          <Button className="w-full" disabled={!valid || saving} onClick={requestSave}>{initial ? "Salvar alterações" : "Salvar pedido"}</Button>
          {!valid && <p className="flex items-start gap-2 text-xs font-bold text-crimson-ink"><TriangleAlert size={14} className="mt-0.5 shrink-0" />{firstMissing} para liberar o salvamento.</p>}
          {errors.length > 0 && <ul role="alert" className="space-y-1 rounded-xl bg-crimson-soft p-3 text-xs font-semibold text-crimson-ink">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          <Button variant="ghost" className="w-full" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </Card>

      {confirmPast && (
        <ConfirmDialog title="A data de entrega já passou" confirmLabel="Cadastrar mesmo assim" busy={saving}
          onConfirm={() => save(true)} onCancel={() => setConfirmPast(false)}>
          A data escolhida ({date && formatDate(date)}) é anterior a hoje. {deadline?.label}. Confirme apenas se esse pedido já foi entregue ou se está sendo registrado depois do prazo.
        </ConfirmDialog>
      )}

      {modal && (
        <MoldModal molds={allMolds} grids={grids} onClose={() => setModal(false)}
          onSaved={(m, add) => { setAllMolds((l) => [...l, m]); setModal(false); if (add) addMold(m); }} />
      )}
    </div>
  );
}

const formatDoc = (d: string) => (d.length === 14 ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") : d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"));
