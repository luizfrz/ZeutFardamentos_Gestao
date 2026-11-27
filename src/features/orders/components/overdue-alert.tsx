import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-server";

const MAX_LISTED = 3;
const dias = (n: number) => `${n} ${n === 1 ? "dia" : "dias"}`;

/** Pedidos pendentes com a entrega vencida, recolhidos no topo da tela inicial (abrem ao clicar). */
export async function OverdueAlert() {
  const overdue = (await api.orders.list({ deadline: "LATE" })).sort((a, b) => a.daysLeft - b.daysLeft); // mais atrasados primeiro
  if (overdue.length === 0) return null;

  const listed = overdue.slice(0, MAX_LISTED);
  const rest = overdue.length - listed.length;

  return (
    <details className="group mb-6 rounded-2xl border border-crimson/30 bg-crimson-soft">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 font-extrabold text-crimson-ink [&::-webkit-details-marker]:hidden">
        <AlertTriangle size={19} className="shrink-0" />
        <span className="min-w-0 flex-1">Ver pedidos atrasados ({overdue.length})</span>
        <ChevronDown size={19} className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4">
        <ul className="space-y-2 border-t border-crimson/20 pt-4 text-sm">
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
        <Link href="/?deadline=LATE" className="mt-4 flex min-h-10 w-full items-center justify-center gap-1 rounded-xl border-2 border-crimson bg-surface px-4 py-2 text-sm font-bold text-crimson-ink hover:bg-crimson hover:text-white sm:w-fit">
          Filtrar só os atrasados<ChevronRight size={16} />
        </Link>
      </div>
    </details>
  );
}
