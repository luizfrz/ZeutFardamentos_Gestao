"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardTitle, Field, Input, useToast } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import type { SizeGrid } from "@/lib/types";

/** Edita os tamanhos de uma grade existente; sem `grid`, cria uma grade nova. */
export function GridEditor({ grid }: { grid?: SizeGrid }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState(grid?.sizes ?? []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const v = input.trim();
    if (v && !sizes.includes(v)) setSizes([...sizes, v]);
    setInput("");
  };

  async function save() {
    setBusy(true); setError(null);
    try {
      if (grid) await api.updateGrid(grid.id, sizes);
      else await api.createGrid({ name: name.trim(), description: description.trim(), sizes });
      toast.success(grid ? "Tamanhos atualizados" : "Grade criada", grid?.name ?? name.trim());
      if (!grid) { setName(""); setDescription(""); setSizes([]); }
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages.join(" ") : "Não foi possível salvar.");
    } finally { setBusy(false); }
  }

  return (
    <Card className="p-6">
      <CardTitle>{grid ? `${grid.name} · ${grid.description}` : "Nova grade de tamanhos"}</CardTitle>
      {!grid && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nome" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Plus Size" /></Field>
          <Field label="Descrição" hint="Opcional"><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: 2 tamanhos" /></Field>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {sizes.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-md bg-navy-soft pl-2.5 text-sm font-bold">
            {s}<button type="button" aria-label={`Remover tamanho ${s}`} onClick={() => setSizes(sizes.filter((x) => x !== s))} className="grid h-9 w-9 place-items-center rounded text-muted hover:text-crimson-ink"><X size={13} /></button>
          </span>
        ))}
      </div>
      <form className="mt-4 flex gap-2 md:w-1/2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Novo tamanho (ex.: XXGG)" aria-label="Novo tamanho" />
        <Button variant="outline" onClick={add}><Plus size={16} />Adicionar</Button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-crimson-ink">{error}</p>}
      <div className="mt-4">
        <Button disabled={busy || !sizes.length || (!grid && !name.trim())} onClick={save}>{grid ? "Salvar tamanhos" : "Criar grade"}</Button>
      </div>
    </Card>
  );
}
