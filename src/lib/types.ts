export type ClientType = "PF" | "PJ" | "ORGAO";
export type ContactKind = "TELEFONE" | "WHATSAPP" | "INSTAGRAM";
export type OrderStatus = "NAO_INICIADO" | "PENDENTE" | "CONCLUIDO";
export type Priority = "URGENTE" | "ALTA" | "MEDIA" | "BAIXA";
export type PieceType = "CIMA" | "BAIXO" | "INTEIRO";
export type MoldCategory = "BLUSA" | "ESTOJO_BOLSA" | "OUTRO";

export interface Contact { kind: ContactKind; value: string; ownerName?: string; ownerDocument?: string }
export interface Address { cep?: string; street?: string; number?: string; complement?: string; district?: string; city?: string; uf?: string }
export interface Client { id: string; type: ClientType; name: string; document?: string; contacts: Contact[]; address?: Address }
export interface Responsible { id: string; name: string; cpf?: string; phone: string }
export interface SizeGrid { id: string; name: string; description: string; sizes: string[] }
export interface Mold {
  id: string; category: MoldCategory; name: string; group?: string; models?: string[];
  gridIds?: string[]; hasSizes?: boolean; variationOfId?: string; notes?: string; size?: string;
  pieceType?: PieceType; properties?: string[];
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
  totalPieces: number; daysLeft: number; priority: Priority;
  /** Valores em centavos */
  totalValue?: number; payments: Payment[]; paidTotal: number; paymentStatus?: "PAGO" | "PENDENTE";
  client?: Client; responsible?: Responsible;
}
export interface Payment { id: string; amount: number; paidAt: string }

export interface Summary { pending: number; urgent: number; dueIn7Days: number; deliveredThisMonth: number }

export interface AppUser { id: string; name: string; email: string; role: "ADMIN" | "USER"; createdAt: string; lastLoginAt: string | null }
