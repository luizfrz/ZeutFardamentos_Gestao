/** Utilidades de sessão SEM dependências de servidor (usadas também pelo proxy). A assinatura é validada pela API. */
export const SESSION_COOKIE = "zeut_session";
/** Rota que o usuário queria abrir antes de ser mandado ao login (cookie curto, definido pelo proxy). */
export const NEXT_COOKIE = "zeut_next";

export type Role = "ADMIN" | "USER";
export interface SessionUser { id: string; name: string; email: string; role: Role; exp: number }

/** Lê os dados do JWT e confere a validade. NÃO verifica a assinatura: quem protege os dados é a API em cada chamada. */
export function decodeToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
    const p = JSON.parse(json) as { sub?: string; name?: string; email?: string; role?: string; exp?: number };
    if (!p.sub || !p.exp || p.exp * 1000 <= Date.now()) return null;
    return { id: p.sub, name: p.name ?? "", email: p.email ?? "", role: p.role === "ADMIN" ? "ADMIN" : "USER", exp: p.exp };
  } catch {
    return null;
  }
}

/** Só aceita caminhos internos (evita "open redirect" para outro site). /signup é um caminho antigo (cadastro público removido). */
export function safeNext(value: string | undefined | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.startsWith("/login") || value.startsWith("/signup")) return "/";
  return value;
}
