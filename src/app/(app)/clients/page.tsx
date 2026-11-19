import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui";
import { ClientsList } from "@/features/clients/clients-list";

export const metadata: Metadata = { title: "Clientes · Zeut" };

export default function ClientsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Clientes" }]} />
      <h1 className="text-4xl font-extrabold tracking-tight">Clientes</h1>
      <p className="mb-8 mt-2 font-semibold text-muted">Consulte e edite os dados cadastrados dos clientes.</p>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-surface/60" />}>
        <ClientsList />
      </Suspense>
    </>
  );
}
