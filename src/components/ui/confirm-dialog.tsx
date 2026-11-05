"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "./button";

export function ConfirmDialog({ title, children, confirmLabel, cancelLabel = "Voltar e corrigir", busy, onConfirm, onCancel }: {
  title: string; children: ReactNode; confirmLabel: string; cancelLabel?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-scrim" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="flex min-h-full items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-3xl bg-surface p-5 shadow-2xl sm:p-7">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-crimson-soft text-crimson-ink [@media(max-height:500px)]:hidden"><TriangleAlert size={24} /></div>
        <h2 id="confirm-title" className="text-2xl font-extrabold">{title}</h2>
        <div className="mt-2 text-[15px] leading-relaxed text-muted">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={onCancel} autoFocus>{cancelLabel}</Button>
          <Button disabled={busy} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
      </div>
    </div>
  );
}
