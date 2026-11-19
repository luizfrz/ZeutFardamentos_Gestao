import { Pencil } from "lucide-react";
import { ButtonLink, Card, CardTitle } from "@/components/ui";
import { api } from "@/lib/api-server";
import { CLIENT_TYPE_LABEL } from "@/lib/format";
import { ClientDeleteButton } from "./client-delete-button";
import { formatDocument } from "@/lib/documents";

export async function ClientsList() {
  const clients = await api.clients.list();
  return (
    <Card className="p-6">
      <CardTitle>Clientes ({clients.length})</CardTitle>
      {clients.length === 0 ? (
        <p className="mt-5 font-semibold text-muted">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {clients.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
              <div className="min-w-0">
                <div className="truncate font-extrabold">{c.name}</div>
                <div className="text-sm font-semibold text-muted">
                  {CLIENT_TYPE_LABEL[c.type]}{c.document ? ` · ${formatDocument(c.document)}` : ""}
                </div>
                <div className="truncate text-xs font-semibold text-subtle">{c.contacts.map((k) => k.value).join(" · ")}</div>
              </div>
              <div className="flex gap-2">
                <ButtonLink variant="outline" href={`/clients/${c.id}/edit`}><Pencil size={16} />Editar</ButtonLink>
                <ClientDeleteButton id={c.id} name={c.name} orders={c.orders ?? []} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
