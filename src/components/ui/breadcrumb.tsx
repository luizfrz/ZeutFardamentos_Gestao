import Link from "next/link";
import { BackButton } from "./back-button";

/**
 * Trilha da página. O primeiro item vira o botão "Voltar" (com seu `href` como destino
 * quando não há histórico); os demais seguem depois: `‹ Voltar / Novo pedido`.
 */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  const [first, ...trail] = items;
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold" aria-label="Breadcrumb">
      <BackButton fallbackHref={first?.href ?? "/"} />
      {trail.map((it) => (
        <span key={it.label} className="flex items-center gap-2">
          <span className="text-subtle" aria-hidden>/</span>
          {it.href ? <Link href={it.href} className="text-crimson-ink hover:underline">{it.label}</Link> : <span className="text-muted">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}
