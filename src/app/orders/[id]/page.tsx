import { Suspense } from "react";
import { OrderDetail } from "@/features/orders/components/order-detail";

export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/60" />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}
