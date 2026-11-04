import { ApiError, createApi, NETWORK_ERROR, toApiError, type RequestFn } from "./api-core";

export { ApiError };

/** Chamada feita pelo navegador: vai ao próprio site (/backend/*), que anexa o token do cookie httpOnly e repassa à API. */
const request: RequestFn = async <T,>(path: string, init?: RequestInit) => {
  let res: Response;
  try {
    res = await fetch(`/backend${path}`, {
      ...init,
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError([NETWORK_ERROR], 0);
  }
  if (res.status === 401) {
    // Navegação completa de propósito: /session-expired é uma rota de servidor que limpa o cookie e redireciona.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/session-expired");
    throw new ApiError(["Sua sessão expirou. Entre novamente."], 401);
  }
  if (!res.ok) throw await toApiError(res);
  return res.json() as Promise<T>;
};

export const api = createApi(request);
