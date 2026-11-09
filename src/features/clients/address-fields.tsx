"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Field, Input, Select } from "@/components/ui";
import { maskCep, onlyDigits } from "@/lib/documents";
import type { Address } from "@/lib/types";

const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
export const emptyAddress = (a?: Address) => ({ cep: "", street: "", number: "", complement: "", district: "", city: "", uf: "CE", ...a });
export type AddressDraft = ReturnType<typeof emptyAddress>;
/** UF tem valor padrão, então sozinha não conta como endereço preenchido. */
export const hasAddress = (a: AddressDraft) => Object.entries(a).some(([k, v]) => k !== "uf" && v.trim());

export function AddressFields({ addr, onChange }: { addr: AddressDraft; onChange: (a: AddressDraft) => void }) {
  const [cepMsg, setCepMsg] = useState<string | null>(null);
  const setA = (p: Partial<AddressDraft>) => onChange({ ...addr, ...p });

  async function lookupCep(cep = addr.cep) {
    const d = onlyDigits(cep);
    if (d.length !== 8) return setCepMsg("Informe os 8 dígitos do CEP");
    setCepMsg("Buscando…");
    try {
      const r = await (await fetch(`https://viacep.com.br/ws/${d}/json/`)).json();
      if (r.erro) return setCepMsg("CEP não encontrado");
      onChange({ ...addr, cep, street: r.logradouro ?? "", district: r.bairro ?? "", city: r.localidade ?? "", uf: r.uf ?? addr.uf });
      setCepMsg(null);
    } catch { setCepMsg("Não foi possível consultar o CEP"); }
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="CEP" hint={cepMsg ?? "Preenche rua, bairro e cidade automaticamente"}>
          <div className="relative">
            <Input value={addr.cep} inputMode="numeric" placeholder="00000-000" onChange={(e) => { const v = maskCep(e.target.value); setA({ cep: v }); if (onlyDigits(v).length === 8) void lookupCep(v); }} className="pr-11" />
            <button type="button" aria-label="Buscar CEP" onClick={() => lookupCep()} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-muted"><Search size={17} /></button>
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
    </>
  );
}
