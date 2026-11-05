"use client";

import { Building2, Search, User } from "lucide-react";
import { useState } from "react";
import { Field, Input } from "@/components/ui";
import { formatDocument, isValidCnpj, isValidCpf, maskDocument, onlyDigits } from "@/lib/documents";

export interface Person { id: string; name: string; document?: string; hint?: string; org?: boolean }

/**
 * Combobox de nome + campo de documento ligados entre si:
 * escolher na lista preenche o documento; digitar um documento válido seleciona a pessoa.
 */
export function PersonPicker({ label, docLabel, people, value, onChange, onCreate, createLabel, allowCnpj = true }: {
  label: string; docLabel: string; people: Person[]; value: string | null; onChange: (id: string | null) => void;
  onCreate?: () => void; createLabel?: string; allowCnpj?: boolean;
}) {
  const selected = people.find((p) => p.id === value) ?? null;
  const [text, setText] = useState("");
  const [docText, setDocText] = useState("");
  const [open, setOpen] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const name = selected ? selected.name : text;
  const doc = selected ? formatDocument(selected.document ?? "") : docText;
  const q = name.toLowerCase();
  const matches = selected ? people : people.filter((p) => !q || p.name.toLowerCase().includes(q));

  function typeName(v: string) { setText(v); setDocText(""); setDocError(null); onChange(null); setOpen(true); }

  function typeDoc(raw: string) {
    const masked = maskDocument(raw);
    const d = onlyDigits(masked);
    setDocText(masked);
    setText(selected?.name ?? text);
    onChange(null);
    const complete = d.length === 11 || (allowCnpj && d.length === 14);
    if (!complete) { setDocError(null); return; }
    const valid = d.length === 11 ? isValidCpf(d) : isValidCnpj(d);
    if (!valid) { setDocError(d.length === 11 ? "CPF inválido" : "CNPJ inválido: os dígitos verificadores não conferem"); return; }
    const found = people.find((p) => p.document === d);
    if (found) { setDocError(null); onChange(found.id); } else setDocError("Documento válido, mas nenhum cadastro encontrado");
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="relative">
        <Field label={label} required>
          <Input
            value={name} onChange={(e) => typeName(e.target.value)} onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Digite para buscar…" icon={<Search size={17} />} role="combobox" aria-expanded={open} autoComplete="off"
          />
        </Field>
        {open && !selected && (
          <ul role="listbox" className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
            {matches.slice(0, 6).map((p) => (
              <li key={p.id}>
                <button type="button" role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(p.id); setOpen(false); setDocError(null); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-navy-soft/70">
                  <span className="text-muted">{p.org ? <Building2 size={17} /> : <User size={17} />}</span>
                  <span><span className="block text-sm font-extrabold">{p.name}</span><span className="block text-xs text-muted">{p.hint ?? (p.document ? formatDocument(p.document) : "Sem CPF cadastrado")}</span></span>
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="px-4 py-3 text-sm text-muted">Nenhum resultado</li>}
            {onCreate && (
              <li className="border-t border-line bg-cream-2">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onCreate} className="w-full px-4 py-3 text-left text-sm font-bold text-crimson-ink">+ {createLabel}</button>
              </li>
            )}
          </ul>
        )}
      </div>
      <Field label={docLabel} error={docError} hint={selected ? (selected.document ? <span className="font-semibold text-ok-ink">{selected.document.length === 14 ? "CNPJ válido" : "CPF válido"} · preenchido ao escolher. Alterar o documento troca a seleção.</span> : "Sem documento cadastrado.") : "Opcional: ajuda a encontrar o cadastro."}>
        <Input value={doc} onChange={(e) => typeDoc(e.target.value)} inputMode="numeric" placeholder={allowCnpj ? "CPF ou CNPJ" : "000.000.000-00"} valid={!!selected?.document} invalid={!!docError} />
      </Field>
    </div>
  );
}
