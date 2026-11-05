import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Botão "Voltar" da marca: pílula branca com texto navy e seta em carmim.
 * Leva SEMPRE à tela inicial (é um link comum: funciona sem JavaScript e é pré-carregado).
 */
export function BackButton({ label = "Voltar", href = "/" }: { label?: string; href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-4 text-sm font-extrabold text-ink shadow-[0_1px_2px_rgba(11,20,69,.08)] transition-all hover:border-navy/30 hover:bg-navy-soft/60 active:scale-[.97]"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-crimson text-white transition-colors group-hover:bg-crimson-dark">
        <ArrowLeft size={15} strokeWidth={3} className="transition-transform group-hover:-translate-x-0.5" />
      </span>
      {label}
    </Link>
  );
}
