import type { ClientType } from "./types";

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = { PF: "Pessoa física", PJ: "Empresa (PJ)", ORGAO: "Órgão público" };

const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const parse = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };

export const formatDate = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}/${m}/${y}`; };
export const formatShort = (iso: string) => formatDate(iso).slice(0, 5);
export const formatLongToday = (d = new Date()) => `${WEEKDAYS[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
export const formatWeekday = (iso: string) => `${WEEKDAYS[parse(iso).getDay()]}, ${formatDate(iso)}`;
export const dayOfMonth = (iso: string) => iso.slice(8, 10);
export const monthAbbr = (iso: string) => MONTHS[parse(iso).getMonth()].slice(0, 3).toUpperCase();

export const daysUntil = (iso: string, today = new Date()) => {
  const t = parse(iso).getTime();
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((t - b) / 86_400_000);
};
export const daysLabel = (n: number) =>
  n < 0 ? `atrasado ${Math.abs(n)} ${Math.abs(n) === 1 ? "dia" : "dias"}` : n === 0 ? "entrega hoje" : `faltam ${n} ${n === 1 ? "dia" : "dias"}`;
export const piecesLabel = (n: number) => `${n} ${n === 1 ? "peça" : "peças"}`;
