"use client";

import { Check, Pencil, Trash2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, ButtonLink, ConfirmDialog, useToast } from "@/components/ui";
import { api } from "@/lib/api-client";
import type { OrderStatus } from "@/lib/types";

export function OrderActions({ id, status }: { id: string; status: OrderStatus }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function change(next: OrderStatus) {
    setError(null);
    start(async () => {
      try {
        await api.orders.setStatus(id, next);
        toast.success(next === "CONCLUIDO" ? "Pedido marcado como concluído" : status === "CONCLUIDO" ? "Pedido reaberto" : "Produção iniciada", "O status do pedido foi atualizado.");
        router.refresh();
      } catch (e) { setError((e as Error).message); toast.error("Não foi possível atualizar o pedido", (e as Error).message); }
    });
  }

  function remove() {
    start(async () => {
      try {
        await api.orders.remove(id);
        toast.success("Pedido excluído", "O pedido e seus pagamentos foram removidos.");
        router.push("/");
        router.refresh();
      } catch (e) { setConfirmDelete(false); setError((e as Error).message); toast.error("Não foi possível excluir o pedido", (e as Error).message); }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-3">
        <ButtonLink variant="outline" className="w-full" href={`/orders/${id}/edit`}><Pencil size={16} />Editar pedido</ButtonLink>
        {status === "CONCLUIDO" ? (
          <Button variant="outline" className="w-full" disabled={pending} onClick={() => change("PENDENTE")}><Undo2 size={16} />Reabrir pedido</Button>
        ) : (
          <>
            {status === "NAO_INICIADO" && <Button variant="navy" className="w-full" disabled={pending} onClick={() => change("PENDENTE")}>Iniciar produção</Button>}
            <Button className="w-full" disabled={pending} onClick={() => change("CONCLUIDO")}><Check size={16} />Marcar como concluído</Button>
          </>
        )}
        <Button variant="outline" disabled={pending} onClick={() => setConfirmDelete(true)} className="w-full border-crimson text-crimson-ink hover:bg-crimson-soft"><Trash2 size={16} />Excluir pedido</Button>
      </div>
      {confirmDelete && (
        <ConfirmDialog title="Excluir este pedido?" confirmLabel="Excluir pedido" cancelLabel="Cancelar" busy={pending} onConfirm={remove} onCancel={() => setConfirmDelete(false)}>
          O pedido, os produtos e os pagamentos registrados serão apagados de forma permanente. Essa ação não pode ser desfeita.
        </ConfirmDialog>
      )}
      {error && <p role="alert" className="text-sm font-semibold text-crimson-ink">{error}</p>}
    </div>
  );
}
