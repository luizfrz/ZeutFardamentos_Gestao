import { Check } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate, piecesLabel } from "@/lib/format";

export async function DeliveredTable() {
  const rows = (await api.orders.list({ status: "CONCLUIDO" })).slice(0, 5);
  if (rows.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-5 text-3xl font-extrabold">Encomendas entregues</h2>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[15px]">
          <thead>
            <tr className="border-b border-line bg-cream-2 text-xs font-extrabold uppercase tracking-wider text-muted">
              {["Pedido", "Cliente", "Responsável", "Quantidade", "Entregue em", "Status"].map((h) => <th key={h} className="px-5 py-3.5">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-cream-2/60">
                <td className="px-5 py-4 font-extrabold"><Link href={`/orders/${o.id}`} className="hover:underline">{o.name}</Link></td>
                <td className="px-5 py-4 font-semibold text-muted">{o.client?.name}</td>
                <td className="px-5 py-4 font-semibold text-muted">{o.responsible?.name.split(" ").slice(0, 2).join(" ")}</td>
                <td className="px-5 py-4 font-semibold text-muted">{piecesLabel(o.totalPieces)}</td>
                <td className="px-5 py-4 font-semibold text-muted">{o.deliveredAt && formatDate(o.deliveredAt)}</td>
                <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1 text-sm font-bold text-ok"><Check size={14} />Concluído</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
