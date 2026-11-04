export type ClientType = "PF" | "PJ" | "ORGAO";
export type ContactKind = "TELEFONE" | "WHATSAPP" | "INSTAGRAM";
export type OrderStatus = "NAO_INICIADO" | "PENDENTE" | "CONCLUIDO";
export type Priority = "URGENTE" | "ALTA" | "MEDIA" | "BAIXA";
export type MoldCategory = "BLUSA" | "ESTOJO_BOLSA" | "OUTRO";

export interface Contact { kind: ContactKind; value: string; ownerName?: string; ownerDocument?: string }
export interface Address { cep?: string; street?: string; number?: string; complement?: string; district?: string; city?: string; uf?: string }
export interface Client { id: string; type: ClientType; name: string; document: string; contacts: Contact[]; address?: Address }
export interface Responsible { id: string; name: string; cpf: string; phone: string }
export interface SizeGrid { id: string; name: string; description: string; sizes: string[] }
export interface Mold {
  id: string; category: MoldCategory; name: string; group?: string; models?: string[];
  gridIds?: string[]; hasSizes?: boolean; variationOfId?: string; notes?: string;
}
export interface OrderItem {
  id?: string; moldId: string; model?: string; color: string;
  grids?: { gridId: string; quantities: Record<string, number> }[];
  quantity?: number;
}
export interface OrderLink { label?: string; url: string }

export interface Order {
  id: string; number: number; name: string; description?: string;
  clientId: string; responsibleId: string; deliveryDate: string;
  status: OrderStatus; createdAt: string; deliveredAt?: string;
  items: OrderItem[]; links: OrderLink[]; images: string[];
  totalPieces: number; daysLeft: number; deadlineLevel: 1 | 2 | 3; priority: Priority;
  client?: Client; responsible?: Responsible;
}

export interface Summary { pending: number; urgent: number; dueIn7Days: number; deliveredThisMonth: number }
