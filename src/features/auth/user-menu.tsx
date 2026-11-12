import { getSessionUser } from "@/lib/session";
import { ProfileMenu } from "./profile-menu";

/** Menu do perfil da pessoa logada (Server Component: lê o cookie e entrega só nome, e-mail e papel ao navegador). */
export async function UserMenu() {
  const user = await getSessionUser();
  if (!user) return null;
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";
  return <ProfileMenu name={user.name} email={user.email} role={user.role} initials={initials} />;
}
