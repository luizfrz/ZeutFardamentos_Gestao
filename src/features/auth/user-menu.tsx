import { LogOut, Users } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { logoutAction } from "./actions";

/** Nome da pessoa logada + botão Sair (Server Component: lê o cookie, não envia nada extra ao navegador). */
export async function UserMenu() {
  const user = await getSessionUser();
  if (!user) return null;
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="hidden items-center gap-2 text-sm font-bold text-white lg:flex" title={user.email}>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-coral text-xs font-extrabold text-navy-fixed" aria-hidden>{initials}</span>
        <span className="max-w-32 truncate">{user.name}</span>
      </span>
      {user.role === "ADMIN" && (
        <Link href="/users" aria-label="Gerenciar usuários" title="Usuários"
          className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-11 sm:w-11">
          <Users size={18} />
        </Link>
      )}
      <form action={logoutAction}>
        <button type="submit" aria-label="Sair da conta" title="Sair"
          className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-11 sm:w-11">
          <LogOut size={18} />
        </button>
      </form>
    </div>
  );
}
