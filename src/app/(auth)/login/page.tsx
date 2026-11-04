import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Entrar · Zeut", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <AuthShell title="Entrar" subtitle="Acesse o painel de encomendas da Zeut.">
      <LoginForm />
    </AuthShell>
  );
}
