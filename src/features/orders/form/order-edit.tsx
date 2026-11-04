import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui";
import { api, ApiError } from "@/lib/api-server";
import { OrderForm } from "./order-form";

export async function OrderEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, molds, grids, clients, responsibles] = await Promise.all([
    api.orders.get(id).catch((e) => { if (e instanceof ApiError && e.status === 404) notFound(); throw e; }),
    api.molds.list(), api.sizeGrids(), api.clients.list(), api.responsibles.list(),
  ]);
  return (
    <>
      <Breadcrumb items={[{ label: "Encomendas", href: "/" }, { label: order.name, href: `/orders/${id}` }, { label: "Editar" }]} />
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight">Editar pedido</h1>
      <OrderForm initial={order} molds={molds} grids={grids} clients={clients} responsibles={responsibles} />
    </>
  );
}
