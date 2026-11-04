import { Suspense } from "react";
import { OrderNew } from "@/features/orders/form/order-new";
import { Breadcrumb } from "@/components/ui";

export default function NewOrderPage({ searchParams }: PageProps<"/orders/new">) {
  return (
    <>
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Novo pedido" }]} />
      <h1 className="text-4xl font-extrabold tracking-tight">Novo pedido</h1>
      <p className="mb-8 mt-2 font-semibold text-muted">Escolha o cliente para consultar os dados dele, adicione os produtos e salve. Campos marcados com <span className="text-crimson">*</span> são obrigatórios.</p>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/60" />}>
        <OrderNew searchParams={searchParams} />
      </Suspense>
    </>
  );
}
