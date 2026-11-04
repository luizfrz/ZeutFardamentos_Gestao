import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui";
import { UsersContent } from "@/features/users/users-content";

export const metadata: Metadata = { title: "Usuários · Zeut" };

export default function UsersPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Usuários" }]} />
      <h1 className="text-4xl font-extrabold tracking-tight">Usuários</h1>
      <p className="mb-8 mt-2 font-semibold text-muted">Contas com acesso ao sistema. Só administradores veem esta página e criam contas.</p>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-surface/60" />}>
        <UsersContent />
      </Suspense>
    </>
  );
}
