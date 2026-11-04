import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui";
import { api } from "@/lib/api-server";
import { OrderCard } from "./order-card";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function PendingOrders({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const orders = await api.orders.list({
    q: one(sp.q), priority: one(sp.priority), status: one(sp.status), deadline: one(sp.deadline), sort: one(sp.sort),
  });
  const hasFilters = Object.values({ q: sp.q, p: sp.priority, s: sp.status, d: sp.deadline }).some(Boolean);
  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-3xl font-extrabold">
          Encomendas pendentes
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-navy px-2 text-xs font-extrabold text-white">{orders.length}</span>
        </h2>
        <p className="flex items-center gap-2 text-sm font-semibold text-muted">
          <AlertTriangle size={15} />Prioridade = prazo de entrega + quantidade de peças. Clique no card para ver o pedido.
        </p>
      </div>
      {orders.length === 0 ? (
        <Card className="p-10 text-center font-semibold text-muted">
          {hasFilters ? "Nenhuma encomenda encontrada com esses filtros." : "Nenhuma encomenda cadastrada ainda. Use \"Cadastrar novo pedido\" para começar."}
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {orders.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </section>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-surface/60" />)}
    </div>
  );
}
