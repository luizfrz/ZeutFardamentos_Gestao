"use client";

import { ChevronDown, LogOut, Palette, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeSwitch } from "@/components/layout/theme-toggle";
import { logoutAction } from "./actions";

/** Menu do perfil: dados da pessoa logada, personalização (aparência), atalho de usuários (admin) e Sair. */
export function ProfileMenu({ name, email, role, initials }: { name: string; email: string; role: "ADMIN" | "USER"; initials: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0 md:border-l md:border-white/20 md:pl-3">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Menu do perfil"
        className="flex h-10 items-center gap-2 rounded-xl bg-white/10 pl-1.5 pr-2 text-sm font-bold text-white transition-colors hover:bg-white/20 sm:h-11 lg:pr-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-coral text-xs font-extrabold text-navy-fixed" aria-hidden>{initials}</span>
        <span className="hidden max-w-32 truncate lg:block">{name}</span>
        <ChevronDown size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-surface p-4 text-ink shadow-xl">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-coral text-sm font-extrabold text-navy-fixed" aria-hidden>{initials}</span>
            <div className="min-w-0">
              <div className="truncate font-extrabold">{name}</div>
              <div className="truncate text-xs text-muted">{email}</div>
              <span className="mt-1 inline-block rounded-full bg-navy-soft px-2 py-0.5 text-[11px] font-bold">{role === "ADMIN" ? "Administrador" : "Usuário"}</span>
            </div>
          </div>

          <div className="py-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted"><Palette size={13} />Personalização</div>
            <ThemeSwitch />
          </div>

          <div className="space-y-1 border-t border-line pt-3">
            {role === "ADMIN" && (
              <Link href="/users" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-navy-soft/60"><Users size={17} />Gerenciar usuários</Link>
            )}
            <form action={logoutAction}>
              <button type="submit" role="menuitem" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold text-crimson-ink hover:bg-crimson-soft"><LogOut size={17} />Sair da conta</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
