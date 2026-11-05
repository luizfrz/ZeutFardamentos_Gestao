"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui";

export type Slide = { key: string; src?: string; file?: File; label?: string; onRemove: () => void };

/** Fotos escolhidas no upload, num slide que rola para o lado (arrastar, setas ou pontinhos). */
export function PhotoSlider({ slides }: { slides: Slide[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const prevCount = useRef(slides.length);
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;

  const goTo = (i: number) => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: Math.min(last, Math.max(0, i)) * el.clientWidth, behavior: "smooth" });
  };

  // Chegou foto nova: o slide rola até ela, para a pessoa ver o que acabou de escolher.
  useEffect(() => {
    const el = scroller.current;
    if (el && slides.length > prevCount.current) el.scrollTo({ left: (slides.length - 1) * el.clientWidth, behavior: "smooth" });
    prevCount.current = slides.length;
  }, [slides.length]);

  if (!slides.length) return null;
  const current = Math.min(index, last);

  return (
    <div className="mt-3" role="group" aria-roledescription="carrossel" aria-label="Fotos do pedido">
      <div className="relative">
        <ul ref={scroller} onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slides.map((s, i) => <SlideCard key={s.key} slide={s} position={`${i + 1} de ${slides.length}`} />)}
        </ul>

        {slides.length > 1 && (
          <>
            <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-extrabold text-white backdrop-blur" aria-live="polite">{current + 1} / {slides.length}</span>
            {([-1, 1] as const).map((d) => {
              const off = d < 0 ? current === 0 : current === last;
              return (
                <button key={d} type="button" onClick={() => goTo(current + d)} disabled={off} aria-label={d < 0 ? "Foto anterior" : "Próxima foto"}
                  className={cx("absolute top-[calc(50%-1rem)] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-all hover:bg-crimson disabled:pointer-events-none disabled:opacity-0", d < 0 ? "left-2" : "right-2")}>
                  {d < 0 ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
                </button>
              );
            })}
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-2 flex justify-center" role="tablist" aria-label="Escolher foto">
          {slides.map((s, i) => (
            <button key={s.key} type="button" role="tab" aria-selected={i === current} aria-label={`Ir para a foto ${i + 1}`} onClick={() => goTo(i)} className="grid h-6 w-5 place-items-center">
              <span className={cx("h-2 rounded-full transition-all duration-300", i === current ? "w-6 bg-crimson" : "w-2 bg-slate/40")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Um slide: a foto inteira (sem corte) sobre ela mesma desfocada, com borda, nome, tamanho e botão de remover. */
function SlideCard({ slide, position }: { slide: Slide; position: string }) {
  const { file, src, label, onRemove } = slide;
  const [local, setLocal] = useState<string>();
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLocal(reader.result as string);
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  const url = src ?? local;
  const name = file?.name ?? label ?? "Foto";

  return (
    <li className="w-full shrink-0 snap-center" aria-roledescription="slide" aria-label={position}>
      <div className="overflow-hidden rounded-xl border-2 border-crimson/50 bg-cream-2">
        <div className="relative aspect-[4/3] w-full">
          {url && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl" draggable={false} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Pré-visualização: ${name}`} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
            </>
          )}
          <button type="button" aria-label={`Remover ${name}`} onClick={onRemove}
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-navy-fixed/85 text-white shadow transition-colors hover:bg-crimson">
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-line bg-surface px-3 py-2 text-xs font-semibold text-muted">
          <span className="min-w-0 truncate">{name}</span>
          <span className="shrink-0">{file ? (file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`) : "Já salva"}</span>
        </div>
      </div>
    </li>
  );
}
