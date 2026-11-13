import type { Priority } from "./types";

/** Mesma regra da API — usada para mostrar a prioridade calculada ao vivo no cadastro. */
export function computePriority(daysLeft: number): Priority {
  if (daysLeft <= 5) return "URGENTE";
  if (daysLeft <= 14) return "ALTA";
  if (daysLeft <= 29) return "MEDIA";
  return "BAIXA";
}

export type DeadlineTone = "danger" | "warn" | "info" | "ok";
export interface DeadlineClass { kind: "PASSADA" | "HOJE" | "P1" | "P2" | "P3"; label: string; tone: DeadlineTone; past: boolean }

const dias = (n: number) => `${n} ${n === 1 ? "dia" : "dias"}`;

/** Classifica a data de entrega pelos dias restantes (negativo = já passou). */
export function classifyDeadline(days: number): DeadlineClass {
  if (days < 0) return { kind: "PASSADA", label: `Data já passou há ${dias(-days)}`, tone: "danger", past: true };
  if (days === 0) return { kind: "HOJE", label: "Entrega hoje", tone: "warn", past: false };
  if (days <= 5) return { kind: "P1", label: `Faltam ${dias(days)}`, tone: "warn", past: false };
  if (days <= 14) return { kind: "P2", label: `Faltam ${dias(days)}`, tone: "warn", past: false };
  return { kind: "P3", label: `Faltam ${dias(days)}`, tone: "ok", past: false };
}
