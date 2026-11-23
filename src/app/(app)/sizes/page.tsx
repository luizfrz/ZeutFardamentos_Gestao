import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui";
import { SizesContent } from "@/features/sizes/sizes-content";

export const metadata: Metadata = { title: "Tamanhos · Zeut" };

export default function SizesPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Início", href: "/" }, { label: "Tamanhos" }]} />
      <h1 className="text-4xl font-extrabold tracking-tight">Tamanhos</h1>
      <p className="mb-8 mt-2 font-semibold text-muted">Grades de tamanho usadas nos pedidos (ex.: XGG, XXGG). Só administradores editam.</p>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-surface/60" />}>
        <SizesContent />
      </Suspense>
    </>
  );
}
