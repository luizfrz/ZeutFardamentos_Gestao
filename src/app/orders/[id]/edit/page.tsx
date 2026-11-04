import { Suspense } from "react";
import { OrderEdit } from "@/features/orders/form/order-edit";

export default function EditPage({ params }: PageProps<"/orders/[id]/edit">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/60" />}>
      <OrderEdit params={params} />
    </Suspense>
  );
}
