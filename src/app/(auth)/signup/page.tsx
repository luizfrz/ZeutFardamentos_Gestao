import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = { title: "Criar conta · Zeut", robots: { index: false, follow: false } };

export default function SignupPage() {
  return (
    <AuthShell title="Criar conta" subtitle="Cadastre-se com o código de acesso da equipe.">
      <SignupForm />
    </AuthShell>
  );
}
