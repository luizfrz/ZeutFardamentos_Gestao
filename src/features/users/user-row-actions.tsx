"use client";

import { KeyRound, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui";
import { PasswordField } from "@/features/auth/password-field";
import { api, ApiError } from "@/lib/api-client";
import type { AppUser } from "@/lib/types";
import { generatePassword } from "./generate-password";

type Mode = null | "password" | "delete";
const btn = "flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold hover:bg-navy-soft disabled:opacity-50";

export function UserRowActions({ user, isSelf }: { user: AppUser; isSelf: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);

  const close = () => { setMode(null); setError(null); setPassword(""); setReveal(false); };

  async function run(action: () => Promise<unknown>, done?: () => void) {
    setBusy(true); setError(null);
    try { await action(); done?.(); router.refresh(); }
    catch (e) { setError(e instanceof ApiError ? e.messages.join(" ") : "Não foi possível concluir."); }
    finally { setBusy(false); }
  }

  const toggleRole = () => run(() => api.users.update(user.id, { role: user.role === "ADMIN" ? "USER" : "ADMIN" }));

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => setMode("password")}><KeyRound size={13} />Redefinir senha</button>
        {!isSelf && (
          <>
            <button type="button" className={btn} disabled={busy} onClick={toggleRole}>
              {user.role === "ADMIN" ? <><ShieldOff size={13} />Tornar usuário</> : <><ShieldCheck size={13} />Tornar admin</>}
            </button>
            <button type="button" className={`${btn} hover:text-crimson-ink`} onClick={() => setMode("delete")}><Trash2 size={13} />Excluir</button>
          </>
        )}
      </div>
      {error && mode === null && <p role="alert" className="w-full text-xs font-bold text-crimson-ink">{error}</p>}

      {mode === "password" && (
        <ConfirmDialog title={`Redefinir senha de ${user.name}`} confirmLabel="Salvar nova senha" cancelLabel="Cancelar" busy={busy || password.length < 8}
          onConfirm={() => run(() => api.users.update(user.id, { password }), close)} onCancel={close}>
          <p className="mb-3">A pessoa entra com a nova senha a partir de agora. Anote antes de salvar: ela não será exibida de novo.</p>
          <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} reveal={reveal} minLength={8} maxLength={128} autoComplete="new-password" placeholder="Nova senha (mín. 8 caracteres)" />
          <button type="button" onClick={() => { setPassword(generatePassword()); setReveal(true); }} className="mt-2 text-xs font-bold text-crimson-ink hover:underline">Gerar senha forte</button>
          {error && <p role="alert" className="mt-3 rounded-lg bg-crimson-soft p-3 text-sm font-bold text-crimson-ink">{error}</p>}
        </ConfirmDialog>
      )}
      {mode === "delete" && (
        <ConfirmDialog title={`Excluir a conta de ${user.name}?`} confirmLabel="Excluir conta" cancelLabel="Cancelar" busy={busy}
          onConfirm={() => run(() => api.users.remove(user.id), close)} onCancel={close}>
          <p>{user.email} perde o acesso ao sistema. Os pedidos e cadastros feitos por essa pessoa continuam salvos.</p>
          {error && <p role="alert" className="mt-3 rounded-lg bg-crimson-soft p-3 text-sm font-bold text-crimson-ink">{error}</p>}
        </ConfirmDialog>
      )}
    </>
  );
}
