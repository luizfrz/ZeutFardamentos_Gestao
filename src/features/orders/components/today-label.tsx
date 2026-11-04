"use client";

import { ArrowUpDown, CalendarDays, Clock } from "lucide-react";
import { formatLongToday } from "@/lib/format";
import { useNowMinutes, useNowSeconds } from "@/lib/use-now";

const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const chip = "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-extrabold text-ink shadow-[0_1px_2px_rgba(11,20,69,.06)]";

/** Chip com a data de hoje (do aparelho do usuário; atualiza sozinha na virada do dia). */
export function TodayLabel() {
  const now = useNowMinutes();
  if (now === null) return <span className="h-8 w-64 animate-pulse rounded-full bg-surface/60" aria-hidden />;
  return (
    <span className={chip}>
      <CalendarDays size={16} className="text-crimson-ink" aria-hidden />
      {formatLongToday(new Date(now))}
    </span>
  );
}

/** Chip com o relógio ao vivo (HH:MM:SS) do aparelho. */
export function LiveClock() {
  const now = useNowSeconds();
  // Fuso e atributos só depois de hidratar: o servidor não conhece o fuso do usuário.
  const zone = now === null ? undefined : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <time dateTime={now === null ? undefined : new Date(now).toISOString()} title={zone} className={`${chip} tabular-nums`}>
      <Clock size={16} className="text-crimson-ink" aria-hidden />
      {now === null ? "--:--:--" : timeFormat.format(new Date(now))}
    </time>
  );
}

/** Etiqueta discreta explicando a ordem da lista. */
export function SortNote() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-soft px-3 py-1.5 text-sm font-semibold text-muted">
      <ArrowUpDown size={14} aria-hidden />
      Ordenadas por prioridade <span className="hidden sm:inline">(prazo + quantidade)</span>
    </span>
  );
}
