"use client";

import { Check, Clock, Plus, Trash2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardTitle, Field, Input, useToast } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import { formatBRL, formatDate, maskBRL, parseBRL } from "@/lib/format";
import type { Order } from "@/lib/types";

export function Payments({ order }: { order: Order }) {
  const router = useRouter();
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toLocaleDateString("sv")); // yyyy-mm-dd local; editável
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { totalValue, paidTotal, paymentStatus, payments } = order;

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true); setError(null);
    try { await fn(); toast.success(ok, "Os pagamentos do pedido foram atualizados."); setAmount(""); router.refresh(); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Não foi possível salvar o pagamento"); }
    finally { setBusy(false); }
  }
  const cents = parseBRL(amount);

  return (
    <Card className="p-6">
      <CardTitle icon={<Wallet size={20} />}>Pagamento</CardTitle>
      {!totalValue ? (
        <p className="mt-4 text-sm font-semibold text-muted">Informe o “Valor total do pedido” em Editar pedido para registrar pagamentos.</p>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div><div className="text-xs font-semibold text-muted">Valor total</div><div className="text-xl font-extrabold">{formatBRL(totalValue)}</div></div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${paymentStatus === "PAGO" ? "bg-ok-soft text-ok-ink" : "bg-amber-soft text-ink"}`}>
              {paymentStatus === "PAGO" ? <Check size={14} /> : <Clock size={14} />}{paymentStatus === "PAGO" ? "Pago" : "Pagamento pendente"}
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {payments.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-cream-2 px-3 py-2 text-sm">
                <span className="font-semibold">Pagamento {i + 1}: <b>{formatBRL(p.amount)}</b> <span className="text-muted">({formatDate(p.paidAt)})</span></span>
                <button type="button" aria-label={`Remover pagamento ${i + 1}`} disabled={busy} onClick={() => run(() => api.orders.removePayment(order.id, p.id), "Pagamento removido")} className="grid h-9 w-9 place-items-center text-muted hover:text-crimson-ink"><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
          {paymentStatus !== "PAGO" && (
            <>
              <p className="mt-3 text-sm font-semibold text-muted">Falta pagar {formatBRL(totalValue - paidTotal)}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Valor (R$)"><Input value={amount} inputMode="numeric" placeholder="0,00" onChange={(e) => setAmount(maskBRL(e.target.value))} /></Field>
                <Field label="Data"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
              </div>
              <Button className="mt-3 w-full" disabled={busy || !cents || !date} onClick={() => run(() => api.orders.addPayment(order.id, { amount: cents!, paidAt: date }), "Pagamento registrado")}><Plus size={16} />Adicionar pagamento</Button>
            </>
          )}
          {error && <p role="alert" className="mt-3 text-xs font-semibold text-crimson-ink">{error}</p>}
        </>
      )}
    </Card>
  );
}
