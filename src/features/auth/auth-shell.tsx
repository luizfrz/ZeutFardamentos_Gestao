import type { ReactNode } from "react";

// GIF transparente 1×1: faz o navegador NÃO baixar a logo no desktop (onde a arte lateral já mostra a marca).
const EMPTY = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

/**
 * Moldura das telas de login/cadastro. Página estática (sem cookies/searchParams) → sai direto do cache da CDN.
 * Imagens: celular baixa só a logo; desktop baixa só a arte lateral. Preload específico para cada tamanho de tela.
 */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <link rel="preload" as="image" href="/brand/logo-full.webp" media="(max-width: 1023px)" fetchPriority="high" />
      <link rel="preload" as="image" href="/brand/login-art.webp" media="(min-width: 1024px)" fetchPriority="high" />

      {/* Arte da marca (só desktop; no celular fica display:none + lazy, então nem é baixada) */}
      <aside className="relative hidden bg-paper lg:block" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/login-art.webp" alt="" width={960} height={960} loading="lazy" decoding="async"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[.82]" />
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          {/* Logo (só celular). Selo creme fixo: some no tema claro e vira um "adesivo" no escuro — um único arquivo. */}
          <div className="mb-8 flex justify-center lg:hidden">
            <picture className="rounded-3xl bg-paper p-4">
              <source media="(min-width: 1024px)" srcSet={EMPTY} />
              <img src="/brand/logo-full.webp" alt="Zeut Fardamentos e Confecções" width={440} height={448} fetchPriority="high" decoding="async" className="h-auto w-36" />
            </picture>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mb-7 mt-1.5 font-semibold text-muted">{subtitle}</p>
          {children}
          <p className="mt-10 text-center text-xs font-semibold text-subtle">Zeut Fardamentos e Confecções</p>
        </div>
      </main>
    </div>
  );
}
