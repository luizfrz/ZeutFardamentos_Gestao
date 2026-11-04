import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { decodeToken, NEXT_COOKIE, SESSION_COOKIE, type SessionUser } from "./token";

const isProd = process.env.NODE_ENV === "production";

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Usuário da sessão atual (ou null). Só leitura do cookie: a validação de verdade é feita pela API. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getToken();
  // Validar a expiração usa o relógio (Date.now): com Cache Components isso só pode acontecer em tempo de requisição.
  await connection();
  return decodeToken(token);
}

/** Cookie httpOnly: nenhum JavaScript da página consegue ler o token. */
export async function createSession(token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", expires: expiresAt });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function takeNextPath(): Promise<string | undefined> {
  const store = await cookies();
  const value = store.get(NEXT_COOKIE)?.value;
  if (value) store.delete(NEXT_COOKIE);
  return value;
}
