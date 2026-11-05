import { Building2, MapPin, MessageCircle, Phone, AtSign, User } from "lucide-react";
import { formatDocument } from "@/lib/documents";
import { CLIENT_TYPE_LABEL } from "@/lib/format";
import type { Client, ContactKind } from "@/lib/types";

const CONTACT: Record<ContactKind, { label: string; icon: typeof Phone }> = {
  TELEFONE: { label: "Telefone", icon: Phone },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle },
  INSTAGRAM: { label: "Instagram", icon: AtSign },
};

/** Dados do cliente consultados ao vincular o pedido. */
export function ClientSummary({ client }: { client: Client }) {
  const a = client.address;
  const address = a && [[a.street, a.number].filter(Boolean).join(", "), a.complement, a.district, [a.city, a.uf].filter(Boolean).join(" - "), a.cep].filter(Boolean).join(" · ");

  return (
    <section aria-label="Dados do cliente" className="rounded-xl border border-amber/40 bg-cream-2 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {client.type === "PF" ? <User size={17} /> : <Building2 size={17} />}
        <span className="font-extrabold">{client.name}</span>
        <span className="rounded-full bg-navy-soft px-2.5 py-0.5 text-xs font-bold">{CLIENT_TYPE_LABEL[client.type]}</span>
      </div>
      <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        {client.document && <div><dt className="text-xs font-semibold text-muted">{client.type === "PF" ? "CPF" : "CNPJ"}</dt><dd className="font-extrabold">{formatDocument(client.document)}</dd></div>}
        {address && <div><dt className="flex items-center gap-1 text-xs font-semibold text-muted"><MapPin size={12} />Endereço</dt><dd className="font-semibold">{address}</dd></div>}
        {client.contacts.map((c) => {
          const { label, icon: Icon } = CONTACT[c.kind];
          return (
            <div key={c.kind + c.value}>
              <dt className="flex items-center gap-1 text-xs font-semibold text-muted"><Icon size={12} />{label}</dt>
              <dd className="font-extrabold">{c.value}</dd>
              {c.ownerName && <dd className="text-xs text-muted">Pertence a: {c.ownerName}{c.ownerDocument ? ` (${c.ownerDocument})` : ""}</dd>}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
