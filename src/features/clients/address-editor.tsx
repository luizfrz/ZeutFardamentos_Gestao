"use client";

import { MapPin, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, useToast } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import type { Address } from "@/lib/types";
import { AddressFields, emptyAddress, hasAddress } from "./address-fields";

/** Mostra o endereço do cliente e permite cadastrar, alterar ou remover (endereço é opcional). */
export function AddressEditor({ clientId, address }: { clientId: string; address?: Address }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(emptyAddress(address));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const a = address;
  const text = a && [[a.street, a.number].filter(Boolean).join(", "), a.complement, a.district, [a.city, a.uf].filter(Boolean).join(" - "), a.cep].filter(Boolean).join(" · ");

  async function save() {
    setSaving(true); setError(null);
    try {
      await api.clients.setAddress(clientId, hasAddress(draft) ? draft : undefined);
      toast.success("Endereço atualizado", "Os dados do cliente foram salvos.");
      setEditing(false);
      router.refresh();
    } catch (e) { setError(e instanceof ApiError ? e.message : "Não foi possível salvar o endereço"); }
    finally { setSaving(false); }
  }

  if (editing) {
    return (
      <div className="mt-4 rounded-xl border border-line bg-cream-2 p-4">
        <AddressFields addr={draft} onChange={setDraft} />
        {error && <p role="alert" className="mt-3 text-xs font-semibold text-crimson-ink">{error}</p>}
        <div className="mt-4 flex gap-3">
          <Button disabled={saving} onClick={save}>Salvar endereço</Button>
          <Button variant="ghost" onClick={() => { setDraft(emptyAddress(address)); setEditing(false); }}>Cancelar</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-1 text-xs font-semibold text-muted"><MapPin size={12} />Endereço</div>
        <div className="text-sm font-semibold">{text || <span className="text-muted">Não informado</span>}</div>
      </div>
      <button type="button" onClick={() => setEditing(true)} className="flex shrink-0 items-center gap-1 py-1 text-sm font-bold text-crimson-ink"><Pencil size={14} />{text ? "Editar" : "Adicionar"}</button>
    </div>
  );
}
