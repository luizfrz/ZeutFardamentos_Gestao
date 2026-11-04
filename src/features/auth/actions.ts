"use server";

import { redirect } from "next/navigation";
import { ApiError, authRequest } from "@/lib/api-server";
import { createSession, destroySession, takeNextPath } from "@/lib/session";
import { safeNext } from "@/lib/token";

/** Estado devolvido ao formulário. Nunca inclui a senha. */
export interface AuthState {
  error?: string;
  errors?: string[];
  values?: { name?: string; email?: string };
}

interface AuthResponse { token: string; expiresAt: string }

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

async function finish(res: AuthResponse): Promise<never> {
  await createSession(res.token, new Date(res.expiresAt));
  redirect(safeNext(await takeNextPath()));
}

function failure(e: unknown, values: AuthState["values"]): AuthState {
  if (e instanceof ApiError) return e.messages.length > 1 ? { errors: e.messages, values } : { error: e.messages[0], values };
  throw e; // redirect() e erros inesperados seguem o fluxo normal do Next
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Informe e-mail e senha.", values: { email } };
  let res: AuthResponse;
  try {
    res = await authRequest<AuthResponse>("/auth/login", { email, password });
  } catch (e) {
    return failure(e, { email });
  }
  return finish(res);
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = { name: text(formData, "name"), email: text(formData, "email").toLowerCase() };
  const password = String(formData.get("password") ?? "");
  if (password !== String(formData.get("confirm") ?? "")) return { error: "As senhas não conferem.", values };
  let res: AuthResponse;
  try {
    res = await authRequest<AuthResponse>("/auth/register", { ...values, password, accessCode: text(formData, "accessCode") });
  } catch (e) {
    return failure(e, values);
  }
  return finish(res);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
