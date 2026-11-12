"use client";

import { Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ThemeSync } from "./theme-toggle";

export function Header({ userMenu, adminNav }: { userMenu?: ReactNode; adminNav?: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  }

  return (
    <header className="bg-header pt-[env(safe-area-inset-top)] text-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:gap-x-6 sm:px-10 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/brand/avatar-128.webp" alt="Zeut" width={48} height={48} unoptimized className="shrink-0 rounded-full" priority />
          <span className="hidden min-w-0 leading-tight min-[400px]:block">
            <span className="block truncate text-lg font-extrabold">Zeut</span>
            <span className="block truncate text-xs text-white/80">Fardamentos e Confecções</span>
          </span>
        </Link>
        {adminNav}

        <form onSubmit={submit} role="search" className="order-last flex min-w-0 basis-full items-center gap-3 rounded-full bg-surface px-4 py-1 text-ink md:order-none md:basis-0 md:flex-1">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar"
            placeholder="Buscar por pedido, cliente, CPF/CNPJ ou responsável"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] font-semibold outline-none placeholder:font-normal placeholder:text-muted"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/register" aria-label="Novo cadastro" title="Novo cadastro"
            className="flex h-10 w-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-crimson text-[15px] font-bold transition-colors hover:bg-crimson-dark sm:h-11 min-[440px]:w-auto min-[440px]:px-5">
            <Plus size={18} /><span className="hidden min-[440px]:inline">Novo cadastro</span>
          </Link>
          <ThemeSync />
          {userMenu}
        </div>
      </div>
    </header>
  );
}
