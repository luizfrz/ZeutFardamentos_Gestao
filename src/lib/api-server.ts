import "server-only";
import { redirect } from "next/navigation";
import { ApiError, API_URL, createApi, NETWORK_ERROR, toApiError, type RequestFn } from "./api-core";
import { getToken } from "./session";

export { ApiError };

/** URL da API usada pelo servidor do site. `API_URL` (privada) tem prioridade sobre `NEXT_PUBLIC_API_URL`. */
export const apiBase = () => (process.env.API_URL ?? API_URL).replace(/\/+$/, "");

/** Chamada autenticada feita pelo servidor (Server Components): anexa o token do cookie. */
const request: RequestFn = async <T,>(path: string, init?: RequestInit) => {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
    });
  } catch {
    throw new ApiError([NETWORK_ERROR], 0);
  }
  if (res.status === 401) redirect("/session-expired"); // token ausente/expirado/revogado: limpa o cookie e volta ao login
  if (!res.ok) throw await toApiError(res);
  return res.json() as Promise<T>;
};

export const api = createApi(request);

/** Login/cadastro: chamadas SEM token (rotas públicas da API). */
export async function authRequest<T>(path: "/auth/login" | "/auth/register", body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new ApiError([NETWORK_ERROR], 0);
  }
  if (!res.ok) throw await toApiError(res);
  return res.json() as Promise<T>;
}
