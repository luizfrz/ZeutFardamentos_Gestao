import { api } from "@/lib/api-server";
import { OrderForm } from "./order-form";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export async function OrderNew({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [molds, grids, clients, responsibles] = await Promise.all([api.molds.list(), api.sizeGrids(), api.clients.list(), api.responsibles.list()]);
  return <OrderForm molds={molds} grids={grids} clients={clients} responsibles={responsibles} presetClientId={one(sp.client)} presetResponsibleId={one(sp.responsible)} />;
}
