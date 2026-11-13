import { Box, PanelBottom, PersonStanding, Shirt, ShoppingBag } from "lucide-react";
import type { MoldCategory, PieceType } from "@/lib/types";

export const CATEGORY_LABEL: Record<MoldCategory, string> = { BLUSA: "Vestuário", ESTOJO_BOLSA: "Estojo ou bolsa", OUTRO: "Outro produto" };
export const categoryIcon = (c: MoldCategory, size = 16) =>
  c === "BLUSA" ? <Shirt size={size} /> : c === "ESTOJO_BOLSA" ? <ShoppingBag size={size} /> : <Box size={size} />;

export const PIECE_LABEL: Record<PieceType, string> = { CIMA: "Peça de cima", BAIXO: "Peça de baixo", INTEIRO: "Corpo inteiro" };
export const pieceIcon = (p: PieceType, size = 16) => p === "CIMA" ? <Shirt size={size} /> : p === "BAIXO" ? <PanelBottom size={size} /> : <PersonStanding size={size} />;
