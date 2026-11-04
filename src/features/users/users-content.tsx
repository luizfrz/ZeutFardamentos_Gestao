import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui";
import { api } from "@/lib/api-server";
import { formatDate } from "@/lib/format";
import { getSessionUser } from "@/lib/session";
import { UserForm } from "./user-form";
import { UserRowActions } from "./user-row-actions";

export async function UsersContent() {
  const me = await getSessionUser();
  if (me?.role !== "ADMIN") redirect("/"); // a API também recusa; isto só evita uma tela quebrada
  const users = await api.users.list();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-6">
        <CardTitle>Contas ({users.length})</CardTitle>
        <ul className="mt-5 divide-y divide-line">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coral text-sm font-extrabold text-navy-fixed" aria-hidden>
                  {u.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-extrabold">{u.name}</span>
                    {u.id === me.id && <span className="rounded-full bg-navy-soft px-2 py-0.5 text-[11px] font-bold">você</span>}
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${u.role === "ADMIN" ? "bg-crimson text-white" : "bg-navy-soft text-ink"}`}>
                      {u.role === "ADMIN" ? "ADMINISTRADOR" : "USUÁRIO"}
                    </span>
                  </div>
                  <div className="truncate text-sm font-semibold text-muted">{u.email}</div>
                  <div className="text-xs font-semibold text-subtle">{u.lastLoginAt ? `Último acesso: ${formatDate(u.lastLoginAt)}` : "Ainda não entrou"}</div>
                </div>
              </div>
              <UserRowActions user={u} isSelf={u.id === me.id} />
            </li>
          ))}
        </ul>
      </Card>
      <UserForm />
    </div>
  );
}
