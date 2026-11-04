"use client";

import { Check, Dices, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Card, CardTitle, Field, Input, Select } from "@/components/ui";
import { PasswordField } from "@/features/auth/password-field";
import { api, ApiError } from "@/lib/api-client";
import { generatePassword } from "./generate-password";

export function UserForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [created, setCreated] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setErrors([]); setCreated(null);
    start(async () => {
      try {
        const u = await api.users.create({
          name: String(fd.get("name")).trim(), email: String(fd.get("email")).trim(), password, role: fd.get("role") === "ADMIN" ? "ADMIN" : "USER",
        });
        form.reset(); setPassword(""); setReveal(false); setCreated(u.email);
        router.refresh();
      } catch (err) {
        setErrors(err instanceof ApiError ? err.messages : ["Não foi possível criar a conta."]);
      }
    });
  }

  return (
    <Card className="p-6 lg:sticky lg:top-6">
      <CardTitle icon={<UserPlus size={20} />}>Nova conta</CardTitle>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field label="Nome" required><Input name="name" required minLength={2} maxLength={80} autoComplete="off" /></Field>
        <Field label="E-mail" required><Input name="email" type="email" required autoComplete="off" inputMode="email" autoCapitalize="none" /></Field>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="new-password" className="text-sm font-extrabold">Senha<span className="ml-0.5 text-crimson-ink">*</span></label>
            <button type="button" onClick={() => { setPassword(generatePassword()); setReveal(true); }}
              className="flex items-center gap-1 text-xs font-bold text-crimson-ink hover:underline"><Dices size={14} />Gerar senha forte</button>
          </div>
          <PasswordField id="new-password" value={password} onChange={(e) => setPassword(e.target.value)} reveal={reveal}
            required minLength={8} maxLength={128} autoComplete="new-password" />
          <p className="mt-1.5 text-xs text-muted">Mínimo de 8 caracteres. Anote a senha e passe à pessoa: ela não é exibida depois.</p>
        </div>
        <Field label="Permissão">
          <Select name="role" defaultValue="USER"><option value="USER">Usuário (cadastros e pedidos)</option><option value="ADMIN">Administrador (também gerencia contas)</option></Select>
        </Field>
        {errors.length > 0 && <ul role="alert" className="space-y-1 rounded-xl bg-crimson-soft p-3 text-sm font-bold text-crimson-ink">{errors.map((m) => <li key={m}>{m}</li>)}</ul>}
        {created && <p role="status" className="flex items-center gap-2 rounded-xl bg-ok-soft p-3 text-sm font-bold text-ok-ink"><Check size={16} />Conta criada: {created}</p>}
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Criando…" : "Criar conta"}</Button>
      </form>
    </Card>
  );
}
