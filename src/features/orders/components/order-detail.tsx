import { AlertTriangle, Building2, Calendar, ImageIcon, Link2, MessageCircle, Package, Phone, Printer, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb, Card, CardTitle, cx, PriorityBadge, StatusBadge } from "@/components/ui";
import { api, ApiError } from "@/lib/api-server";
import { CLIENT_TYPE_LABEL, dayOfMonth, formatDate, formatWeekday, monthAbbr } from "@/lib/format";
import { formatDocument } from "@/lib/documents";
import { AddressEditor } from "@/features/clients/address-editor";
import { ProductionStages } from "./production-stages";
import { Payments } from "./payments";
import { PhotoGallery } from "./photo-gallery";
import { OrderActions } from "./order-actions";
import { QuantityTable } from "./quantity-table";

export async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, molds, grids] = await Promise.all([
    api.orders.get(id).catch((e) => { if (e instanceof ApiError && e.status === 404) notFound(); throw e; }),
    api.molds.list(),
    api.sizeGrids(),
  ]);
  const clients = order.clients?.length ? order.clients : order.client ? [order.client] : [];
  const responsibles = order.responsibles?.length ? order.responsibles : order.responsible ? [order.responsible] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Encomendas", href: "/" }, { label: order.name }]} />

      {order.stages.includes("ENVIO_IMPRESSAO") && (
        <div role="status" className="mb-6 flex items-center gap-3 rounded-xl bg-ok-soft px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-ok-ink">
          <Printer size={20} className="shrink-0" />Foi enviado pra impressão
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <PriorityBadge priority={order.priority} />
        <StatusBadge status={order.status} />
        <span className="text-sm font-semibold text-muted">Pedido #{String(order.number).padStart(4, "0")} · cadastrado em {formatDate(order.createdAt)}</span>
      </div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight">{order.name}</h1>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-6">
          <ProductionStages key={order.stages.join()} id={order.id} stages={order.stages} />

          <Card className="p-6">
            <CardTitle icon={<ImageIcon size={20} />}>Imagens</CardTitle>
            {order.images.length ? (
              <PhotoGallery images={order.images} title={order.name} />
            ) : (
              <div className="mt-5 grid h-72 place-items-center rounded-xl border border-line bg-cream-2 text-center text-sm font-semibold text-muted">
                <div><ImageIcon size={32} className="mx-auto mb-2 text-slate" />Nenhuma imagem anexada</div>
              </div>
            )}
          </Card>

          {order.description && (
            <Card className="p-6">
              <h2 className="mb-3 text-xl font-extrabold">Descrição</h2>
              <p className="leading-relaxed">{order.description}</p>
            </Card>
          )}

          <Card className="p-6">
            <CardTitle icon={<Package size={20} />}>Quantidade detalhada</CardTitle>
            <QuantityTable order={order} molds={molds} grids={grids} />
          </Card>
        </div>

        <aside className="min-w-0 space-y-6">
          <Card className="p-6">
            <CardTitle icon={<Calendar size={20} />}>Prazo de entrega</CardTitle>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-crimson text-center text-white">
                {order.deliveryDate
                  ? <div><div className="text-2xl font-extrabold leading-none">{dayOfMonth(order.deliveryDate)}</div><div className="mt-0.5 text-[11px] font-extrabold">{monthAbbr(order.deliveryDate)}</div></div>
                  : <Calendar size={26} />}
              </div>
              <div>
                <div className="font-extrabold">{order.deliveryDate ? formatWeekday(order.deliveryDate) : "Sem prazo definido"}</div>
                <div className={cx("text-sm font-semibold", order.daysLeft <= 5 && order.status !== "CONCLUIDO" ? "text-crimson-ink" : "text-muted")}>
                  {order.status === "CONCLUIDO" ? `Entregue em ${order.deliveredAt && formatDate(order.deliveredAt)}`
                    : !order.deliveryDate ? "Edite o pedido para definir a data"
                    : `${order.daysLeft < 0 ? `Atrasado ${-order.daysLeft} dias` : `Faltam ${order.daysLeft} dias`}`}
                </div>
              </div>
            </div>
            {order.priority === "URGENTE" && order.status !== "CONCLUIDO" && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-crimson-soft p-3 text-sm font-semibold text-crimson-ink">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />Prioridade urgente: entrega em até 5 dias.
              </p>
            )}
          </Card>

          <OrderActions id={order.id} status={order.status} />

          <Payments order={order} />

          <Card className="p-6">
            <CardTitle icon={<Building2 size={20} />}>{clients.length > 1 ? "Clientes" : "Cliente"}</CardTitle>
            {clients.map((client, i) => (
              <div key={client.id} className={cx(i > 0 && "mt-5 border-t border-line pt-1")}>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="font-extrabold">{client.name}</span>
                  <span className="rounded-full bg-navy-soft px-2.5 py-0.5 text-xs font-bold">{CLIENT_TYPE_LABEL[client.type]}</span>
                </div>
                {client.document && (
                  <>
                    <div className="mt-4 text-xs font-semibold text-muted">{client.type === "PF" ? "CPF" : "CNPJ"}</div>
                    <div className="font-extrabold">{formatDocument(client.document)}</div>
                  </>
                )}
                <AddressEditor clientId={client.id} address={client.address} />
                {client.contacts.map((c) => (
                  <div key={c.kind + c.value} className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-cream-2 p-3">
                    {c.kind === "TELEFONE" ? <Phone size={17} /> : <MessageCircle size={17} />}
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold">{c.kind === "WHATSAPP" ? "WhatsApp" : c.kind === "TELEFONE" ? "Telefone" : "Instagram"} · {c.value}</div>
                      {c.ownerName && <div className="text-xs text-muted">Pertence a: {c.ownerName}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Card>

          <Card className="p-6">
            <CardTitle icon={<User size={20} />}>{responsibles.length > 1 ? "Responsáveis pelo pedido" : "Responsável pelo pedido"}</CardTitle>
            {responsibles.map((responsible, i) => (
              <div key={responsible.id} className={cx(i > 0 && "mt-5 border-t border-line pt-1")}>
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-coral text-sm font-extrabold text-white">
                    {responsible.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <div><div className="font-extrabold">{responsible.name}</div>{responsible.cpf && <div className="text-sm text-muted">CPF {formatDocument(responsible.cpf)}</div>}</div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-muted"><Phone size={15} />Telefone · {responsible.phone}</div>
              </div>
            ))}
          </Card>

          {order.links.length > 0 && (
            <Card className="p-6">
              <CardTitle icon={<Link2 size={20} />}>Links</CardTitle>
              <div className="mt-4 space-y-3">
                {order.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-line bg-cream-2 p-3 hover:border-crimson">
                    <Link2 size={16} className="shrink-0 text-crimson-ink" />
                    <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-crimson-ink">{l.label ?? l.url}</span><span className="block truncate text-xs text-muted">{l.url.replace(/^https?:\/\//, "")}</span></span>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
