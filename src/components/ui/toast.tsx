"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cn";

type Kind = "success" | "error";
type ToastItem = { id: number; kind: Kind; title: string; text?: string };
type Api = { success: (title: string, text?: string) => void; error: (title: string, text?: string) => void };

const ToastContext = createContext<Api | null>(null);
const DURATION = { success: 4500, error: 7000 } as const;

/** Avisos de sucesso/erro. Fica no layout da área logada, então sobrevive à troca de página (ex.: salvar e ir para o pedido). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((cur) => cur.filter((t) => t.id !== id)), []);
  const push = useCallback((kind: Kind, title: string, text?: string) => {
    const id = ++seq.current;
    setItems((cur) => [...cur.slice(-2), { id, kind, title, text }]); // no máximo 3 na tela
    setTimeout(() => dismiss(id), DURATION[kind]);
  }, [dismiss]);

  const api = useMemo<Api>(() => ({ success: (t, x) => push("success", t, x), error: (t, x) => push("error", t, x) }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:px-8 sm:pb-8">
        {items.map((t) => <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const ok = item.kind === "success";
  return (
    <div role={ok ? "status" : "alert"} aria-live={ok ? "polite" : "assertive"}
      className="toast-in pointer-events-auto relative flex w-full max-w-[420px] items-start gap-3 overflow-hidden rounded-2xl border border-line bg-surface py-3.5 pl-4 pr-3 shadow-xl">
      <span className={cx("absolute inset-y-0 left-0 w-1.5", ok ? "bg-ok" : "bg-crimson")} />
      <span className={cx("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full", ok ? "bg-ok-soft text-ok-ink" : "bg-crimson-soft text-crimson-ink")}>
        {ok ? <CircleCheck size={20} /> : <CircleAlert size={20} />}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-extrabold leading-snug">{item.title}</p>
        {item.text && <p className="mt-0.5 text-[13px] font-semibold leading-snug text-muted">{item.text}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar aviso" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-navy-soft hover:text-ink">
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast(): Api {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}
