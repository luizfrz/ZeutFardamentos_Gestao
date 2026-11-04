import { Box, Shirt, ShoppingBag } from "lucide-react";
import type { MoldCategory } from "@/lib/types";

export const CATEGORY_LABEL: Record<MoldCategory, string> = { BLUSA: "Blusa", ESTOJO_BOLSA: "Estojo ou bolsa", OUTRO: "Outro produto" };
export const categoryIcon = (c: MoldCategory, size = 16) =>
  c === "BLUSA" ? <Shirt size={size} /> : c === "ESTOJO_BOLSA" ? <ShoppingBag size={size} /> : <Box size={size} />;
