import { Calendar, ChevronRight, ImageIcon, Package, User } from "lucide-react";
import Link from "next/link";
import { daysLabel, formatShort, piecesLabel } from "@/lib/format";
import type { Order } from "@/lib/types";
import { cx, PRIORITY_BAR, PriorityBadge, StatusBadge } from "@/components/ui";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-5 shadow-[0_1px_3px_rgba(11,20,69,.06)] transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <span className={cx("absolute inset-y-0 left-0 w-1.5", PRIORITY_BAR[order.priority])} />
      <div className="mb-4 grid h-[132px] place-items-center overflow-hidden rounded-xl border border-line bg-cream-2 text-slate">
        {order.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={order.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={26} />
        )}
      </div>
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-extrabold leading-snug">{order.name}</h3>
        <PriorityBadge priority={order.priority} />
      </div>
      <ul className="mb-4 space-y-2 text-sm font-semibold text-muted">
        <li className="flex items-center gap-2.5"><User size={15} className="shrink-0 text-ink" />{order.client?.name}</li>
        <li className="flex items-center gap-2.5"><Calendar size={15} className="shrink-0 text-ink" />Entrega {formatShort(order.deliveryDate)} · {daysLabel(order.daysLeft)}</li>
        <li className="flex items-center gap-2.5"><Package size={15} className="shrink-0 text-ink" />{piecesLabel(order.totalPieces)}</li>
      </ul>
      <div className="mt-auto flex items-center justify-between">
        <StatusBadge status={order.status} />
        <span className="flex items-center gap-1 text-sm font-bold text-crimson-ink">Ver detalhes<ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}
