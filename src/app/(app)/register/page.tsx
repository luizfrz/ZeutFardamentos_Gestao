import { Suspense } from "react";
import { RegistrationContent } from "@/features/registration/registration-content";
import { Breadcrumb } from "@/components/ui";

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <>
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Novo cadastro" }]} />
      <h1 className="text-4xl font-extrabold tracking-tight">Novo cadastro</h1>
      <p className="mb-8 mt-2 font-semibold text-muted">Campos marcados com <span className="text-crimson-ink">*</span> são obrigatórios. O formulário só pode ser salvo quando todos estiverem preenchidos.</p>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface/60" />}>
        <RegistrationContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
