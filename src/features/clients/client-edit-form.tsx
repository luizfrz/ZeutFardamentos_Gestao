"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui";
import type { Client } from "@/lib/types";
import { ClientForm } from "./client-form";

export function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter();
  const toast = useToast();
  return (
    <ClientForm initial={client} onCancel={() => router.push("/clients")}
      onSaved={(c) => { toast.success("Cliente atualizado com sucesso", c.name); router.push("/clients"); router.refresh(); }} />
  );
}
