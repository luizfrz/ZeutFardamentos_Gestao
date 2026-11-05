"use client";

import { Check, Package } from "lucide-react";
import { useState } from "react";
import { Button, Card, ChecklistItem, Field, Input, StepTitle } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { isValidCpf, isValidPhone, maskCpf, maskPhone } from "@/lib/documents";
import type { Responsible } from "@/lib/types";

export function ResponsibleForm({ onSaved, onCancel }: { onSaved: (r: Responsible, thenOrder: boolean) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfTouched, setCpfTouched] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const cpfOk = !cpf || isValidCpf(cpf); // CPF é opcional; se informado, precisa ser válido
  const phoneOk = isValidPhone(phone);
  const cpfInvalid = cpfTouched && !cpfOk;
  const phoneInvalid = phoneTouched && !phoneOk;
  const valid = !!name.trim() && cpfOk && phoneOk;

  async function save(thenOrder: boolean) {
    setCpfTouched(true); setPhoneTouched(true);
    if (!valid) return;
    setSaving(true); setErrors([]);
    try { onSaved(await api.responsibles.create({ name: name.trim(), cpf: cpf || undefined, phone }), thenOrder); }
    catch (e) { setErrors(e instanceof ApiError ? e.messages : ["Não foi possível salvar o responsável"]); }
    finally { setSaving(false); }
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-7">
        <StepTitle n={1} title="Dados do responsável" subtitle="Pessoa da Zeut que acompanha o pedido do início à entrega." />
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nome completo" required><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="CPF" hint="Opcional" error={cpfInvalid && "CPF inválido: os dígitos verificadores não conferem"}>
            <Input value={cpf} inputMode="numeric" placeholder="000.000.000-00" onChange={(e) => setCpf(maskCpf(e.target.value))} onBlur={() => cpf && setCpfTouched(true)} invalid={cpfInvalid} valid={!!cpf && cpfOk} />
          </Field>
          <Field label="Telefone" required error={phoneInvalid && (phone ? "Telefone inválido: informe DDD + número" : "Campo obrigatório")} hint="Com DDD, ex.: (85) 99999-9999">
            <Input value={phone} inputMode="tel" placeholder="(00) 00000-0000" onChange={(e) => setPhone(maskPhone(e.target.value))} onBlur={() => setPhoneTouched(true)} invalid={phoneInvalid} valid={phoneOk} />
          </Field>
        </div>
      </Card>
      <Card className="p-6 lg:sticky lg:top-6">
        <h2 className="mb-4 text-xl font-extrabold">Situação do cadastro</h2>
        <ul className="space-y-3">
          <ChecklistItem ok={!!name.trim()}>Nome</ChecklistItem>
          <ChecklistItem ok={cpfOk}>{cpf ? "CPF válido" : "CPF (opcional)"}</ChecklistItem>
          <ChecklistItem ok={phoneOk}>Telefone válido</ChecklistItem>
        </ul>
        <div className="mt-5 space-y-3 border-t border-line pt-5">
          <Button className="w-full" disabled={!valid || saving} onClick={() => save(false)}><Check size={16} />Salvar responsável</Button>
          <Button variant="outline" className="w-full" disabled={!valid || saving} onClick={() => save(true)}><Package size={16} />Salvar e criar pedido</Button>
          {errors.length > 0 && <ul role="alert" className="space-y-1 rounded-xl bg-crimson-soft p-3 text-xs font-semibold text-crimson-ink">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          <Button variant="ghost" className="w-full" onClick={onCancel}>Cancelar</Button>
        </div>
      </Card>
    </div>
  );
}
