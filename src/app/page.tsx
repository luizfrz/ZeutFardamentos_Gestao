import { Plus } from "lucide-react";
import { Suspense } from "react";
import { DeliveredTable } from "@/features/orders/components/delivered-table";
import { OverdueAlert } from "@/features/orders/components/overdue-alert";
import { Filters } from "@/features/orders/components/filters";
import { OrdersSkeleton, PendingOrders } from "@/features/orders/components/pending-orders";
import { SummaryCards } from "@/features/orders/components/summary-cards";
import { TodayLabel } from "@/features/orders/components/today-label";
import { ButtonLink } from "@/components/ui";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Encomendas</h1>
          <TodayLabel />
        </div>
        <ButtonLink href="/orders/new"><Plus size={18} />Cadastrar novo pedido</ButtonLink>
      </div>

      <Suspense fallback={null}>
        <OverdueAlert />
      </Suspense>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-white/60" />}>
        <SummaryCards />
      </Suspense>

      <div className="mt-8">
        <Suspense fallback={<div className="h-24 rounded-2xl bg-white/60" />}><Filters /></Suspense>
      </div>

      <Suspense fallback={<OrdersSkeleton />}>
        <PendingOrders searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={null}>
        <DeliveredTable />
      </Suspense>
    </>
  );
}
