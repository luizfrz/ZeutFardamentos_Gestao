import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui";
import { api, ApiError } from "@/lib/api-server";
import { ClientEditForm } from "./client-edit-form";

export async function ClientEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await api.clients.get(id).catch((e) => { if (e instanceof ApiError && e.status === 404) notFound(); throw e; });
  return (
    <>
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Clientes", href: "/clients" }, { label: client.name }]} />
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight">Editar cliente</h1>
      <ClientEditForm client={client} />
    </>
  );
}
