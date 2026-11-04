"use client";

import { Building2, Check, AtSign, MessageCircle, Package, Phone, Plus, Search, TriangleAlert, User, X } from "lucide-react";
import { useState } from "react";
import { Button, Card, Checkbox, ChecklistItem, Field, Input, Segmented, Select, StepTitle } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { isValidCnpj, isValidCpf, maskCep, maskCnpj, maskCpf, maskDocument, maskPhone, onlyDigits } from "@/lib/documents";
import type { Client, ClientType, ContactKind } from "@/lib/types";

interface DraftContact { kind: ContactKind; value: string; notOwn: boolean; ownerName: string; ownerDocument: string }
const emptyContact = (): DraftContact => ({ kind: "WHATSAPP", value: "", notOwn: false, ownerName: "", ownerDocument: "" });
const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
const KIND_LABEL: Record<ContactKind, string> = { TELEFONE: "Telefone", WHATSAPP: "WhatsApp", INSTAGRAM: "Instagram" };

export function ClientForm({ onSaved, onCancel }: { onSaved: (c: Client, thenOrder: boolean) => void; onCancel: () => void }) {
  const [type, setType] = useState<ClientType>("PJ");
  const [name, setName] = useState("");
  const [doc, setDoc] = useState("");
  const [docTouched, setDocTouched] = useState(false);
  const [contacts, setContacts] = useState<DraftContact[]>([emptyContact()]);
  const [addr, setAddr] = useState({ cep: "", street: "", number: "", complement: "", district: "", city: "", uf: "CE" });
  const [cepMsg, setCepMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const isPf = type === "PF";
  const docLabel = isPf ? "CPF" : "CNPJ";
  const docOk = isPf ? isValidCpf(doc) : isValidCnpj(doc);
  const docInvalid = docTouched && !docOk;
  const hasContact = contacts.some((c) => c.value.trim());
  const ownersOk = contacts.every((c) => !c.notOwn || c.ownerName.trim());
  const anyNotOwn = contacts.some((c) => c.notOwn);
  const valid = !!name.trim() && docOk && hasContact && ownersOk;

  const setContact = (i: number, p: Partial<DraftContact>) => setContacts((cs) => cs.map((c, j) => (j === i ? { ...c, ...p } : c)));
  const setA = (p: Partial<typeof addr>) => setAddr((a) => ({ ...a, ...p }));

  async function lookupCep() {
    const d = onlyDigits(addr.cep);
    if (d.length !== 8) return setCepMsg("Informe os 8 dígitos do CEP");
    setCepMsg("Buscando…");
    try {
      const r = await (await fetch(`https://viacep.com.br/ws/${d}/json/`)).json();
      if (r.erro) return setCepMsg("CEP não encontrado");
      setA({ street: r.logradouro ?? "", district: r.bairro ?? "", city: r.localidade ?? "", uf: r.uf ?? addr.uf });
      setCepMsg(null);
    } catch { setCepMsg("Não foi possível consultar o CEP"); }
  }

  async function save(thenOrder: boolean) {
    setDocTouched(true);
    if (!valid) return;
    setSaving(true); setErrors([]);
    try {
      const hasAddr = Object.entries(addr).some(([k, v]) => k !== "uf" && v.trim());
      const client = await api.clients.create({
        type, name: name.trim(), document: doc,
        contacts: contacts.filter((c) => c.value.trim()).map((c) => ({
          kind: c.kind, value: c.value.trim(),
          ...(c.notOwn ? { ownerName: c.ownerName.trim(), ownerDocument: c.ownerDocument || undefined } : {}),
        })),
        address: hasAddr ? addr : undefined,
      });
      onSaved(client, thenOrder);
    } catch (e) {
      setErrors(e instanceof ApiError ? e.messages : ["Não foi possível salvar o cliente"]);
    } finally { setSaving(false); }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <Card className="p-7">
          <StepTitle n={1} title="Identificação" subtitle="Clientes podem ser pessoas, empresas ou órgãos públicos." />
          <div className="mb-1.5 text-sm font-extrabold">Tipo de cliente <span className="text-crimson-ink">*</span></div>
          <Segmented<ClientType> fill value={type} onChange={(t) => { setType(t); setDoc(""); setDocTouched(false); }}
            options={[{ value: "PF", label: "Pessoa física", icon: <User size={16} /> }, { value: "PJ", label: "Empresa (PJ)", icon: <Building2 size={16} /> }, { value: "ORGAO", label: "Órgão público", icon: <Building2 size={16} /> }]} />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Nome / Razão social" required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label={docLabel} required error={docInvalid && `${docLabel} inválido: os dígitos verificadores não conferem`}>
              <Input value={doc} inputMode="numeric" onChange={(e) => setDoc(isPf ? maskCpf(e.target.value) : maskCnpj(e.target.value))} onBlur={() => doc && setDocTouched(true)}
                invalid={docInvalid} valid={docOk} placeholder={isPf ? "000.000.000-00" : "00.000.000/0000-00"} />
            </Field>
          </div>
        </Card>

        <Card className="p-7">
          <StepTitle n={2} title="Forma de contato" subtitle="Obrigatório informar pelo menos uma forma de contato." />
          <div className="space-y-6">
            {contacts.map((c, i) => (
              <div key={i} className={i > 0 ? "border-t border-line pt-6" : ""}>
                <div className="mb-1.5 flex items-center justify-between text-sm font-extrabold">
                  <span>Tipo de contato <span className="text-crimson-ink">*</span></span>
                  {i > 0 && <button type="button" aria-label="Remover contato" onClick={() => setContacts(contacts.filter((_, j) => j !== i))} className="text-muted hover:text-crimson-ink"><X size={16} /></button>}
                </div>
                <Segmented<ContactKind> fill value={c.kind} onChange={(k) => setContact(i, { kind: k, value: "" })}
                  options={[{ value: "TELEFONE", label: "Telefone", icon: <Phone size={16} /> }, { value: "WHATSAPP", label: "WhatsApp", icon: <MessageCircle size={16} /> }, { value: "INSTAGRAM", label: "Instagram", icon: <AtSign size={16} /> }]} />
                <div className="mt-5 md:w-1/2">
                  <Field label={c.kind === "INSTAGRAM" ? "Perfil do Instagram" : `Número do ${KIND_LABEL[c.kind]}`} required>
                    <Input value={c.value} onChange={(e) => setContact(i, { value: c.kind === "INSTAGRAM" ? e.target.value : maskPhone(e.target.value) })}
                      placeholder={c.kind === "INSTAGRAM" ? "@perfil" : "(00) 00000-0000"} inputMode={c.kind === "INSTAGRAM" ? "text" : "tel"} />
                  </Field>
                </div>
                <div className="mt-5"><Checkbox checked={c.notOwn} onChange={(v) => setContact(i, { notOwn: v })}>Este contato não pertence ao cliente</Checkbox></div>
                {c.notOwn && (
                  <div className="mt-4 rounded-xl border border-amber/40 bg-cream-2 p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-extrabold"><User size={15} />Informe a quem pertence este contato</div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="A quem pertence" required><Input value={c.ownerName} onChange={(e) => setContact(i, { ownerName: e.target.value })} placeholder="Ex.: Márcia Oliveira (Secretaria de Educação)" /></Field>
                      <Field label="CPF/CNPJ do dono do contato" hint="Opcional"><Input value={c.ownerDocument} inputMode="numeric" onChange={(e) => setContact(i, { ownerDocument: maskDocument(e.target.value) })} placeholder="000.000.000-00" /></Field>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setContacts([...contacts, emptyContact()])} className="mt-6 flex items-center gap-1.5 text-sm font-bold text-crimson-ink"><Plus size={16} />Adicionar outra forma de contato</button>
        </Card>

        <Card className="p-7">
          <StepTitle n={3} title="Endereço" subtitle="Opcional" />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="CEP" hint={cepMsg ?? "Preenche rua, bairro e cidade automaticamente"}>
              <div className="relative">
                <Input value={addr.cep} inputMode="numeric" placeholder="00000-000" onChange={(e) => { const v = maskCep(e.target.value); setA({ cep: v }); if (onlyDigits(v).length === 8) void lookupCep(); }} className="pr-11" />
                <button type="button" aria-label="Buscar CEP" onClick={lookupCep} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><Search size={17} /></button>
              </div>
            </Field>
            <Field label="Rua / Logradouro"><Input value={addr.street} onChange={(e) => setA({ street: e.target.value })} placeholder="Rua, avenida…" /></Field>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <Field label="Número"><Input value={addr.number} onChange={(e) => setA({ number: e.target.value })} placeholder="Nº" /></Field>
            <Field label="Complemento"><Input value={addr.complement} onChange={(e) => setA({ complement: e.target.value })} placeholder="Apto, sala…" /></Field>
            <Field label="Bairro"><Input value={addr.district} onChange={(e) => setA({ district: e.target.value })} placeholder="Bairro" /></Field>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Cidade"><Input value={addr.city} onChange={(e) => setA({ city: e.target.value })} placeholder="Cidade" /></Field>
            <Field label="UF"><Select value={addr.uf} onChange={(e) => setA({ uf: e.target.value })}>{UFS.map((u) => <option key={u}>{u}</option>)}</Select></Field>
          </div>
        </Card>
      </div>

      <Card className="p-6 lg:sticky lg:top-6">
        <h2 className="mb-4 text-xl font-extrabold">Situação do cadastro</h2>
        <ul className="space-y-3">
          <ChecklistItem ok>Tipo de cliente</ChecklistItem>
          <ChecklistItem ok={!!name.trim()}>Nome / Razão social</ChecklistItem>
          <ChecklistItem ok={docOk}>{docLabel} válido</ChecklistItem>
          <ChecklistItem ok={hasContact}>Forma de contato</ChecklistItem>
          {anyNotOwn && <ChecklistItem ok={ownersOk}>A quem pertence o contato</ChecklistItem>}
        </ul>
        <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-navy-soft p-3.5 text-xs font-semibold"><TriangleAlert size={15} className="mt-0.5 shrink-0" />O CPF/CNPJ é validado ao sair do campo: formato, dígitos verificadores e números repetidos (ex.: 111.111.111-11).</p>
        <div className="mt-5 space-y-3 border-t border-line pt-5">
          <Button className="w-full" disabled={!valid || saving} onClick={() => save(false)}><Check size={16} />Salvar cliente</Button>
          <Button variant="outline" className="w-full" disabled={!valid || saving} onClick={() => save(true)}><Package size={16} />Salvar e criar pedido</Button>
          {errors.length > 0 && <ul role="alert" className="space-y-1 rounded-xl bg-crimson-soft p-3 text-xs font-semibold text-crimson-ink">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          <Button variant="ghost" className="w-full" onClick={onCancel}>Cancelar</Button>
        </div>
      </Card>
    </div>
  );
}
