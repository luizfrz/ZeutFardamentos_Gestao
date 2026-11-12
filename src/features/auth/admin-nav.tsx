import { Users } from "lucide-react";
import { NavLink } from "@/components/layout/nav-link";
import { getSessionUser } from "@/lib/session";

/** Atalhos de administração, na esquerda do cabeçalho (só aparece para administradores, a partir de telas médias). */
export async function AdminNav() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return null;
  return (
    <nav aria-label="Administração" className="hidden md:flex">
    </nav>
  );
}
