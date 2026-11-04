import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

const MAX_LISTED = 3;
const dias = (n: number) => `${n} ${n === 1 ? "dia" : "dias"}`;

/** Aviso no topo da tela inicial quando há pedidos pendentes com a data de entrega vencida. */
export async function OverdueAlert() {
  const overdue = (await api.orders.list({ deadline: "LATE" })).sort((a, b) => a.daysLeft - b.daysLeft); // mais atrasados primeiro
  if (overdue.length === 0) return null;

  const listed = overdue.slice(0, MAX_LISTED);
  const rest = overdue.length - listed.length;

  return (
    <section role="alert" className="mb-6 rounded-2xl border border-crimson/30 bg-crimson-soft p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crimson text-white"><AlertTriangle size={19} /></span>
          <div>
            <h2 className="text-lg font-extrabold text-crimson-ink">
              {overdue.length === 1 ? "Há 1 pedido atrasado" : `Há ${overdue.length} pedidos atrasados`}
            </h2>
            <p className="text-sm font-semibold text-ink">A data de entrega já passou e eles ainda não foram concluídos.</p>
          </div>
        </div>
        <Link href="/?deadline=LATE" className="flex items-center gap-1 rounded-xl border-2 border-crimson bg-surface px-4 py-2 text-sm font-bold text-crimson-ink hover:bg-crimson hover:text-white">
          Ver atrasados<ChevronRight size={16} />
        </Link>
      </div>
      <ul className="mt-4 space-y-2 border-t border-crimson/20 pt-4 text-sm">
        {listed.map((o) => (
          <li key={o.id}>
            <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-semibold hover:underline">
              <span className="font-extrabold">{o.name}</span>
              <span className="text-muted">{o.client?.name}</span>
              <span className="rounded-full bg-crimson px-2.5 py-0.5 text-xs font-extrabold text-white">atrasado há {dias(-o.daysLeft)}</span>
            </Link>
          </li>
        ))}
        {rest > 0 && <li className="font-semibold text-muted">+ {rest} {rest === 1 ? "outro pedido atrasado" : "outros pedidos atrasados"}</li>}
      </ul>
    </section>
  );
}
