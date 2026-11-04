export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function maskCpf(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function maskCnpj(v: string) {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
/** Máscara automática: CPF até 11 dígitos, CNPJ acima disso */
export const maskDocument = (v: string) => (onlyDigits(v).length > 11 ? maskCnpj(v) : maskCpf(v));
export const maskCep = (v: string) => onlyDigits(v).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

const allEqual = (d: string) => /^(\d)\1+$/.test(d);
export function isValidCpf(v: string) {
  const d = onlyDigits(v);
  if (d.length !== 11 || allEqual(d)) return false;
  for (const t of [9, 10]) {
    let s = 0;
    for (let i = 0; i < t; i++) s += Number(d[i]) * (t + 1 - i);
    if (((s * 10) % 11) % 10 !== Number(d[t])) return false;
  }
  return true;
}
export function isValidCnpj(v: string) {
  const d = onlyDigits(v);
  if (d.length !== 14 || allEqual(d)) return false;
  for (const t of [12, 13]) {
    let s = 0, w = t - 7;
    for (let i = 0; i < t; i++) { s += Number(d[i]) * w--; if (w < 2) w = 9; }
    const dv = s % 11 < 2 ? 0 : 11 - (s % 11);
    if (dv !== Number(d[t])) return false;
  }
  return true;
}

export const formatDocument = (v: string) => (onlyDigits(v).length === 14 ? maskCnpj(v) : maskCpf(v));

/** Telefone brasileiro com DDD: 10 dígitos (fixo) ou 11 (celular com 9). */
export function isValidPhone(v: string) {
  const d = onlyDigits(v);
  return (d.length === 10 || d.length === 11) && d[0] !== "0" && (d.length === 10 || d[2] === "9");
}
