"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui";

/** Fotos do pedido: miniaturas quadradas; ao clicar abre um modal quadrado com slide (setas, pontos, teclado e arrastar). */
export function PhotoGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus(); // devolve o foco ao botão que abriu
  }, []);

  return (
    <>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((u, i) => (
          <li key={u}>
            <button type="button" aria-label={`Abrir foto ${i + 1} de ${images.length}`}
              onClick={(e) => { opener.current = e.currentTarget; setOpen(i); }}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl border-2 border-crimson/50 bg-cream-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Foto ${i + 1} do pedido`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              {i === 0 && images.length > 1 && <span className="absolute bottom-2 right-2 rounded-full bg-navy-fixed/80 px-2 py-0.5 text-[11px] font-extrabold text-white">{images.length} fotos</span>}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox images={images} title={title} start={open} onClose={close} />}
    </>
  );
}

function Lightbox({ images, title, start, onClose }: { images: string[]; title: string; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const [startX, setStartX] = useState<number | null>(null); // onde o dedo/mouse começou a arrastar (null = parado)
  const [drag, setDrag] = useState(0); // deslocamento (px) enquanto arrasta
  const closeRef = useRef<HTMLButtonElement>(null);
  const last = images.length - 1;

  const go = useCallback((d: number) => setIndex((i) => Math.min(last, Math.max(0, i + d))), [last]);

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // a página atrás não rola
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
  }, [go, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Fotos de ${title}`}
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Quadrado: lado = o menor entre a largura e a altura disponíveis */}
      <div className="relative aspect-square w-[min(100%,calc(100dvh-1.5rem),680px)] overflow-hidden rounded-3xl bg-navy-fixed shadow-2xl ring-1 ring-white/10">
        <div
          className={cx("flex h-full", startX === null && "transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]")}
          style={{ transform: `translateX(calc(${-index * 100}% + ${drag}px))` }}
          onPointerDown={(e) => { setStartX(e.clientX); e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { if (startX !== null) setDrag(e.clientX - startX); }}
          onPointerUp={() => {
            if (startX === null) return;
            if (drag < -50) go(1); else if (drag > 50) go(-1);
            setStartX(null); setDrag(0);
          }}
          onPointerCancel={() => { setStartX(null); setDrag(0); }}
        >
          {images.map((u, i) => (
            <div key={u} className="relative h-full w-full shrink-0 select-none touch-pan-y" aria-hidden={i !== index} role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${images.length}`}>
              {/* fundo: a própria foto desfocada, para qualquer proporção ficar bonita sem cortar a foto */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" draggable={false} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Foto ${i + 1} de ${images.length}`} className="relative h-full w-full object-contain" draggable={false} loading={Math.abs(i - index) <= 1 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>

        <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-crimson">
          <X size={20} />
        </button>

        {images.length > 1 && (
          <>
            <span className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1.5 text-xs font-extrabold text-white backdrop-blur" aria-live="polite">{index + 1} / {images.length}</span>
            {([-1, 1] as const).map((d) => {
              const disabled = d < 0 ? index === 0 : index === last;
              return (
                <button key={d} type="button" onClick={() => go(d)} disabled={disabled} aria-label={d < 0 ? "Foto anterior" : "Próxima foto"}
                  className={cx("absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-all hover:bg-crimson disabled:pointer-events-none disabled:opacity-0", d < 0 ? "left-3" : "right-3")}>
                  {d < 0 ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
              );
            })}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2" role="tablist" aria-label="Escolher foto">
              {images.map((_, i) => (
                <button key={i} type="button" role="tab" aria-selected={i === index} aria-label={`Ir para a foto ${i + 1}`} onClick={() => setIndex(i)}
                  className="grid h-6 w-6 place-items-center">
                  <span className={cx("h-2 rounded-full bg-white transition-all duration-300", i === index ? "w-6" : "w-2 opacity-50")} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
