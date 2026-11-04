"use client";

import { Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
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
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
          <Image src="/logo.png" alt="Zeut" width={48} height={48} className="shrink-0 rounded-full" priority />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-lg font-extrabold">Zeut</span>
            <span className="block truncate text-xs text-white/80">Fardamentos e Confecções</span>
          </span>
        </Link>

        <form onSubmit={submit} role="search" className="order-last flex min-w-0 basis-full items-center gap-3 rounded-full bg-surface px-4 py-2 text-ink md:order-none md:basis-0 md:flex-1">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar"
            placeholder="Buscar por pedido, cliente, CPF/CNPJ ou responsável"
            className="min-w-0 flex-1 bg-transparent py-1 text-[15px] font-semibold outline-none placeholder:font-normal placeholder:text-muted"
          />
        </form>

        <ThemeToggle />

        <Link href="/register" className="flex shrink-0 items-center gap-1.5 rounded-xl bg-crimson px-3.5 py-2.5 text-sm font-bold hover:bg-crimson-dark sm:gap-2 sm:px-5 sm:py-3 sm:text-[15px]">
          <Plus size={18} />Novo cadastro
        </Link>
      </div>
    </header>
  );
}
