import type { Client, Mold, Order, OrderStatus, Responsible, SizeGrid, Summary } from "./types";

/** URL pública da API (usada em mensagens). As chamadas reais passam pelo servidor do site, nunca direto do navegador. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

export class ApiError extends Error {
  constructor(public messages: string[], public status: number) {
    super(messages.join(" · "));
  }
}

export const NETWORK_ERROR = "Não foi possível conectar à API. Verifique se ela está em execução e tente novamente.";

/** Converte uma resposta de erro da API em ApiError (mensagens já em português). */
export async function toApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  const msg = body?.message;
  return new ApiError(Array.isArray(msg) ? msg : [msg ?? "Erro inesperado"], res.status);
}

export type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;

const qs = (p: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]).toString();
  return s ? `?${s}` : "";
};

/** Endpoints da API; `request` define COMO chamar (servidor com token do cookie, ou navegador via /backend). */
export function createApi(request: RequestFn) {
  return {
    orders: {
      list: (p: Record<string, string | undefined> = {}) => request<Order[]>(`/orders${qs(p)}`),
      summary: () => request<Summary>("/orders/summary"),
      get: (id: string) => request<Order>(`/orders/${id}`),
      create: (body: unknown) => request<Order>("/orders", { method: "POST", body: JSON.stringify(body) }),
      update: (id: string, body: unknown) => request<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
      setStatus: (id: string, status: OrderStatus) =>
        request<Order>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    },
    clients: {
      list: (q?: string) => request<Client[]>(`/clients${qs({ q })}`),
      create: (body: unknown) => request<Client>("/clients", { method: "POST", body: JSON.stringify(body) }),
    },
    responsibles: {
      list: (q?: string) => request<Responsible[]>(`/responsibles${qs({ q })}`),
      create: (body: unknown) => request<Responsible>("/responsibles", { method: "POST", body: JSON.stringify(body) }),
    },
    molds: {
      list: () => request<Mold[]>("/molds"),
      create: (body: unknown) => request<Mold>("/molds", { method: "POST", body: JSON.stringify(body) }),
      remove: (id: string) => request<{ id: string }>(`/molds/${id}`, { method: "DELETE" }),
    },
    sizeGrids: () => request<SizeGrid[]>("/size-grids"),
  };
}
