"use client";

import { Check, Pencil, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui";
import { api } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";

export function OrderActions({ id, status }: { id: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(next: OrderStatus) {
    setError(null);
    start(async () => {
      try { await api.orders.setStatus(id, next); router.refresh(); }
      catch (e) { setError((e as Error).message); }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-3">
        <ButtonLink variant="outline" href={`/orders/${id}/edit`}><Pencil size={16} />Editar pedido</ButtonLink>
        {status === "CONCLUIDO" ? (
          <Button variant="outline" disabled={pending} onClick={() => change("PENDENTE")}><Undo2 size={16} />Reabrir pedido</Button>
        ) : (
          <>
            {status === "NAO_INICIADO" && <Button variant="navy" disabled={pending} onClick={() => change("PENDENTE")}>Iniciar produção</Button>}
            <Button disabled={pending} onClick={() => change("CONCLUIDO")}><Check size={16} />Marcar como concluído</Button>
          </>
        )}
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-crimson-ink">{error}</p>}
    </div>
  );
}
