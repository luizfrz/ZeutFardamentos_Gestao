"use client";

import { CalendarDays } from "lucide-react";
import { formatLongToday } from "@/lib/format";
import { useNowMinutes } from "@/lib/use-now";

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
