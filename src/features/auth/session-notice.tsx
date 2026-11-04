"use client";

import { Info } from "lucide-react";
import { useSearchParams } from "next/navigation";

/** Aviso "sessão expirou" (lido da URL no navegador, para a página continuar 100% estática). */
export function SessionNotice() {
  if (!useSearchParams().has("expired")) return null;
  return (
    <p role="status" className="mb-5 flex items-center gap-2.5 rounded-xl bg-amber-soft p-3.5 text-sm font-bold text-ink">
      <Info size={17} className="shrink-0" aria-hidden />Sua sessão expirou. Entre novamente para continuar.
    </p>
  );
}
