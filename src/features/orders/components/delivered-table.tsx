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
      <h2 className="mb-5 text-2xl font-extrabold sm:text-3xl">Encomendas entregues</h2>

      {/* Celular: lista de cards (a tabela exigiria rolagem lateral) */}
      <ul className="space-y-3 md:hidden">
        {rows.map((o) => (
          <li key={o.id}>
            <Link href={`/orders/${o.id}`} className="block rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_3px_rgba(11,20,69,.06)]">
              <div className="flex items-start justify-between gap-3">
                <span className="font-extrabold leading-snug">{o.name}</span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok-ink"><Check size={12} />Concluído</span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-semibold text-muted">
                <div className="col-span-2">{o.client?.name}</div>
                <div>{piecesLabel(o.totalPieces)}</div>
                <div className="text-right">{o.deliveredAt && formatDate(o.deliveredAt)}</div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>

      <Card className="hidden overflow-x-auto md:block">
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
                <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1 text-sm font-bold text-ok-ink"><Check size={14} />Concluído</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
