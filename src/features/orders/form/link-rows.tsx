"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import type { Client, Responsible } from "@/lib/types";
import { ClientSummary } from "./client-summary";
import { PersonPicker, type Person } from "./person-picker";

/** Uma linha de vínculo: `id` é a pessoa escolhida (null = vazia); `key` muda ao limpar, para o campo recomeçar. */
export interface LinkRow { key: string; id: string | null }

let seq = 0;
export const newRow = (id: string | null = null): LinkRow => ({ key: `r${++seq}`, id });

const CLIENT = { label: "Nome do cliente", docLabel: "CPF/CNPJ do cliente", add: "Adicionar mais um cliente", remove: "Remover cliente", create: "Cadastrar novo cliente", href: "/register" };
const RESP = { label: "Responsável pelo pedido", docLabel: "CPF do responsável", add: "Adicionar mais um responsável", remove: "Remover responsável", create: "Cadastrar novo responsável", href: "/register?tab=responsible" };

interface Props<T> { rows: LinkRow[]; onChange: (rows: LinkRow[]) => void; people: Person[]; all: T[] }

/** Linhas de cliente ou de responsável com "x" para remover (a última linha só é esvaziada). */
export function LinkRows<T extends Client | Responsible>({ kind, rows, onChange, people, all }: Props<T> & { kind: "client" | "responsible" }) {
  const router = useRouter();
  const t = kind === "client" ? CLIENT : RESP;
  const chosen = rows.map((r) => r.id).filter((x): x is string => !!x);
  const set = (key: string, id: string | null) => onChange(rows.map((r) => (r.key === key ? { ...r, id } : r)));
  const drop = (r: LinkRow) => onChange(rows.length > 1 ? rows.filter((x) => x.key !== r.key) : [newRow()]);

  return (
    <>
      {rows.map((r) => {
        const client = kind === "client" ? (all as Client[]).find((c) => c.id === r.id) : undefined;
        return (
          <div key={r.key} className="space-y-5">
            <div className="flex flex-col-reverse gap-1 sm:flex-row sm:items-start sm:gap-3">
              <div className="min-w-0 flex-1">
                <PersonPicker label={t.label} docLabel={t.docLabel} value={r.id} onChange={(id) => set(r.key, id)}
                  people={people} exclude={chosen.filter((id) => id !== r.id)} allowCnpj={kind === "client"}
                  onCreate={() => router.push(t.href)} createLabel={t.create} />
              </div>
              <Button variant="outline" aria-label={t.remove} disabled={rows.length === 1 && !r.id} onClick={() => drop(r)} className="h-10 shrink-0 self-end !px-4 !py-0 sm:mt-[26px] sm:h-[47px] sm:self-auto"><X size={20} /></Button>
            </div>
            {client && <ClientSummary client={client} />}
          </div>
        );
      })}
    </>
  );
}

/** "Adicionar mais um cliente" OU "Adicionar mais um responsável"; só libera quando não há linha vazia. */
export function AddLinks({ clientRows, onClients, respRows, onResponsibles }: { clientRows: LinkRow[]; onClients: (r: LinkRow[]) => void; respRows: LinkRow[]; onResponsibles: (r: LinkRow[]) => void }) {
  const btn = "flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-crimson bg-crimson-soft/70 px-5 py-3 text-[15px] font-bold text-crimson-ink hover:bg-crimson-soft disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
      <button type="button" className={btn} disabled={clientRows.some((r) => !r.id)} onClick={() => onClients([...clientRows, newRow()])}><Plus size={18} />{CLIENT.add}</button>
      <span className="text-center text-sm font-bold">OU</span>
      <button type="button" className={btn} disabled={respRows.some((r) => !r.id)} onClick={() => onResponsibles([...respRows, newRow()])}><Plus size={18} />{RESP.add}</button>
    </div>
  );
}
