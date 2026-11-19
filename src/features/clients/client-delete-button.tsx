"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ConfirmDialog, useToast } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";

export function ClientDeleteButton({ id, name, orders }: { id: string; name: string; orders: { id: string; name: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true); setError(null);
    try {
      await api.clients.remove(id);
      toast.success("Cliente excluído", name);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.messages.join(" ") : "Não foi possível excluir o cliente.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <Button variant="outline" aria-label={`Excluir ${name}`} onClick={() => { setError(null); setOpen(true); }} className="border-crimson px-3.5 text-crimson-ink hover:bg-crimson-soft"><Trash2 size={16} /></Button>
      {open && (
        <ConfirmDialog title={orders.length ? "Este cliente não pode ser excluído" : "Excluir este cliente?"} confirmLabel="Excluir cliente" cancelLabel={orders.length ? "Entendi" : "Cancelar"} busy={busy}
          onConfirm={orders.length ? () => setOpen(false) : remove} onCancel={() => setOpen(false)}>
          {orders.length ? (
            <>
              <p><strong>{name}</strong> tem {orders.length === 1 ? "um pedido vinculado" : `${orders.length} pedidos vinculados`}. Exclua {orders.length === 1 ? "o pedido" : "os pedidos"} antes de apagar o cliente:</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 font-bold">
                {orders.map((o) => <li key={o.id}><Link href={`/orders/${o.id}`} className="underline">{o.name}</Link></li>)}
              </ul>
            </>
          ) : (
            <p><strong>{name}</strong> e os contatos cadastrados serão apagados de forma permanente. Essa ação não pode ser desfeita.</p>
          )}
          {error && <p role="alert" className="mt-3 rounded-xl bg-crimson-soft p-3 text-sm font-semibold text-crimson-ink">{error}</p>}
        </ConfirmDialog>
      )}
    </>
  );
}
