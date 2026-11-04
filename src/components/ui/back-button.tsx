"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Botão "Voltar" da marca: pílula branca com texto navy e seta em carmim.
 * Volta para a página anterior; sem histórico (acesso direto), cai em `fallbackHref`.
 */
export function BackButton({ label = "Voltar", fallbackHref = "/" }: { label?: string; fallbackHref?: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-4 text-sm font-extrabold text-ink shadow-[0_1px_2px_rgba(11,20,69,.08)] transition-all hover:border-navy/30 hover:bg-navy-soft/60 active:scale-[.97]"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-crimson text-white transition-colors group-hover:bg-crimson-dark">
        <ArrowLeft size={15} strokeWidth={3} className="transition-transform group-hover:-translate-x-0.5" />
      </span>
      {label}
    </button>
  );
}
