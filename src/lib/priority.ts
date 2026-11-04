import type { Priority } from "./types";

/** Mesma regra da API — usada para mostrar a prioridade calculada ao vivo no cadastro. */
export function computePriority(daysLeft: number, pieces: number): Priority {
  if (daysLeft < 7) return pieces >= 50 ? "URGENTE" : "ALTA";
  if (daysLeft <= 14) return "MEDIA";
  return "BAIXA";
}
export const deadlineLevel = (d: number) => (d < 7 ? 1 : d <= 14 ? 2 : 3);

export type DeadlineTone = "danger" | "warn" | "info" | "ok";
export interface DeadlineClass { kind: "PASSADA" | "HOJE" | "P1" | "P2" | "P3"; label: string; tone: DeadlineTone; past: boolean }

const dias = (n: number) => `${n} ${n === 1 ? "dia" : "dias"}`;

/** Classifica a data de entrega pelos dias restantes (negativo = já passou). */
export function classifyDeadline(days: number): DeadlineClass {
  if (days < 0) return { kind: "PASSADA", label: `Data já passou há ${dias(-days)}`, tone: "danger", past: true };
  if (days === 0) return { kind: "HOJE", label: "Entrega hoje · P.E. 1", tone: "warn", past: false };
  if (days < 7) return { kind: "P1", label: `Faltam ${dias(days)} · P.E. 1 (menos de 7 dias)`, tone: "warn", past: false };
  if (days <= 14) return { kind: "P2", label: `Faltam ${dias(days)} · P.E. 2 (7 a 14 dias)`, tone: "info", past: false };
  return { kind: "P3", label: `Faltam ${dias(days)} · P.E. 3 (mais de 14 dias)`, tone: "ok", past: false };
}
