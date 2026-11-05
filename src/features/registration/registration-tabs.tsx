"use client";

import { Building2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cx, useToast } from "@/components/ui";
import { ClientForm } from "@/features/clients/client-form";
import { ResponsibleForm } from "@/features/responsibles/responsible-form";

export type Tab = "client" | "responsible";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "client", label: "Cliente", icon: <Building2 size={17} /> },
  { id: "responsible", label: "Responsável", icon: <User size={17} /> },
];

/** Mantém os dois formulários montados para não perder o que foi digitado ao trocar de aba. */
export function RegistrationTabs({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>(initialTab);
  const cancel = () => router.push("/");

  return (
    <>
      <div role="tablist" className="mb-8 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={cx("-mb-px flex items-center gap-2 border-b-[3px] px-5 py-3.5 text-[15px] font-bold transition-colors",
              tab === t.id ? "border-crimson text-ink" : "border-transparent text-muted hover:text-ink")}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div hidden={tab !== "client"}>
        <ClientForm onCancel={cancel} onSaved={(c, thenOrder) => { toast.success("Cliente cadastrado com sucesso", c.name); router.push(thenOrder ? `/orders/new?client=${c.id}` : "/"); }} />
      </div>
      <div hidden={tab !== "responsible"}>
        <ResponsibleForm onCancel={cancel} onSaved={(r, thenOrder) => { toast.success("Responsável cadastrado com sucesso", r.name); router.push(thenOrder ? `/orders/new?responsible=${r.id}` : "/"); }} />
      </div>
    </>
  );
}
