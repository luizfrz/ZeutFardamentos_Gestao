import { Calendar, Factory, Wallet, ChevronRight, ImageIcon, Package, User } from "lucide-react";
import Link from "next/link";
import { daysLabel, formatBRL, formatShort, piecesLabel } from "@/lib/format";
import { currentStage } from "@/lib/stages";
import type { Order } from "@/lib/types";
import { cx, PRIORITY_BAR, PriorityBadge, StatusBadge } from "@/components/ui";

export function OrderCard({ order }: { order: Order }) {
  const late = !!order.deliveryDate && order.daysLeft < 0 && order.status !== "CONCLUIDO";
  return (
    <Link
      href={`/orders/${order.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-5 shadow-[0_1px_3px_rgba(11,20,69,.06)] transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <span className={cx("absolute inset-y-0 left-0 w-1.5", PRIORITY_BAR[order.priority], late && "motion-safe:animate-pulse")} />
      <div className={cx("relative mb-4 grid h-[132px] place-items-center overflow-hidden rounded-xl bg-cream-2 text-slate", order.images[0] ? "border-2 border-crimson/50" : "border border-line")}>
        {order.images[0] ? (
          <>
            {/* fundo: a própria foto desfocada; em cima, a foto inteira (sem cortar) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.images[0]} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.images[0]} alt="Foto do pedido" loading="lazy" className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
            {order.images.length > 1 && (
              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-navy-fixed/80 px-2 py-0.5 text-[11px] font-extrabold text-white">+{order.images.length - 1}</span>
            )}
          </>
        ) : (
          <ImageIcon size={26} />
        )}
      </div>
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-base font-extrabold leading-snug">{order.name}</h3>
        <PriorityBadge priority={order.priority} />
      </div>
      <ul className="mb-4 space-y-2 text-sm font-semibold text-muted">
        <li className="flex items-center gap-2.5"><User size={15} className="shrink-0 text-ink" />{order.client?.name}{(order.clients?.length ?? 0) > 1 && <span className="rounded-full bg-navy-soft px-1.5 text-xs font-bold text-ink">+{order.clients!.length - 1}</span>}</li>
        <li className={cx("flex items-center gap-2.5", late && "font-extrabold text-crimson-ink")}><Calendar size={15} className={cx("shrink-0", late ? "motion-safe:animate-pulse" : "text-ink")} />{order.deliveryDate ? `Entrega ${formatShort(order.deliveryDate)} · ${daysLabel(order.daysLeft)}` : "Sem prazo"}</li>
        <li className="flex items-center gap-2.5"><Package size={15} className="shrink-0 text-ink" />{piecesLabel(order.totalPieces)}</li>
        {order.totalValue ? (() => {
          const pct = Math.min(100, Math.round((order.paidTotal / order.totalValue) * 100));
          const paid = order.paymentStatus === "PAGO";
          return (
            <li className="space-y-1.5">
              <div className="flex items-center gap-2.5"><Wallet size={15} className="shrink-0 text-ink" />
                {paid ? `${formatBRL(order.totalValue)} · Pago` : `${formatBRL(order.paidTotal)} de ${formatBRL(order.totalValue)}`}
              </div>
              <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Pagamento" className="h-1.5 overflow-hidden rounded-full bg-navy-soft">
                <div className={cx("h-full rounded-full", paid ? "bg-ok" : "bg-amber")} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })() : null}
        {currentStage(order.stages) && <li className="flex items-center gap-2.5"><Factory size={15} className="shrink-0 text-ink" />Etapa: {currentStage(order.stages)}</li>}
      </ul>
      <div className="mt-auto flex items-center justify-between">
        <StatusBadge status={order.status} />
        <span className="flex items-center gap-1 text-sm font-bold text-crimson-ink">Ver detalhes<ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}
