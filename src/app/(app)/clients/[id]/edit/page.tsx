import { Suspense } from "react";
import { ClientEdit } from "@/features/clients/client-edit";

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface/60" />}>
      <ClientEdit params={params} />
    </Suspense>
  );
}
