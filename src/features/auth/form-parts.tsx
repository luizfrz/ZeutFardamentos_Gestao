"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { control } from "@/components/ui/fields";
import { cx } from "@/lib/cn";
import type { AuthState } from "./actions";

export const authInput = cx(control, "border-slate/70");

export function Label({ htmlFor, children, hint }: { htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-extrabold">
      {children}{hint && <span className="ml-1.5 font-semibold text-muted">{hint}</span>}
    </label>
  );
}

/** Mensagens de erro do servidor, anunciadas por leitores de tela. */
export function FormError({ state, id }: { state: AuthState; id: string }) {
  const list = state.errors ?? (state.error ? [state.error] : []);
  if (!list.length) return null;
  return (
    <div id={id} role="alert" className="flex gap-2.5 rounded-xl bg-crimson-soft p-3.5 text-sm font-bold text-crimson-ink">
      <AlertTriangle size={17} className="mt-0.5 shrink-0" aria-hidden />
      <div>{list.map((m) => <p key={m}>{m}</p>)}</div>
    </div>
  );
}

export function SubmitButton({ pending, children, pendingLabel }: { pending: boolean; children: ReactNode; pendingLabel: string }) {
  return (
    <button type="submit" disabled={pending} aria-busy={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-crimson px-5 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-crimson-dark disabled:cursor-wait disabled:opacity-80">
      {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Foca o primeiro campo só com mouse/teclado (no celular abriria o teclado sem o usuário pedir). */
export function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) ref.current?.focus();
  }, []);
  return ref;
}
