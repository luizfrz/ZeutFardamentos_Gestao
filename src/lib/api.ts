import type { Client, Mold, Order, OrderStatus, Responsible, SizeGrid, Summary } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

export class ApiError extends Error {
  constructor(public messages: string[], public status: number) {
    super(messages.join(" · "));
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    // Rede/servidor fora do ar: erro amigável no lugar do "fetch failed" cru.
    throw new ApiError(["Não foi possível conectar à API. Verifique se ela está em execução e tente novamente."], 0);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg = body?.message;
    throw new ApiError(Array.isArray(msg) ? msg : [msg ?? "Erro inesperado"], res.status);
  }
  return res.json() as Promise<T>;
}

const qs = (p: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]).toString();
  return s ? `?${s}` : "";
};

export const api = {
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
  },
  sizeGrids: () => request<SizeGrid[]>("/size-grids"),
};
