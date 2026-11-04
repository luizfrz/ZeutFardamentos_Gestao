"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type AuthState } from "./actions";
import { authInput, FormError, Label, SubmitButton, useAutoFocus } from "./form-parts";
import { PasswordField } from "./password-field";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signupAction, {});
  const nameRef = useAutoFocus<HTMLInputElement>();
  const hasError = Boolean(state.error || state.errors);
  const describedBy = hasError ? "signup-error" : undefined;

  return (
    <>
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <input ref={nameRef} id="name" name="name" required minLength={2} maxLength={80} defaultValue={state.values?.name}
            autoComplete="name" autoCapitalize="words" className={authInput} placeholder="Seu nome" />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <input id="email" name="email" type="email" required defaultValue={state.values?.email} autoComplete="username"
            inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} className={authInput} placeholder="voce@empresa.com" />
        </div>
        <div>
          <Label htmlFor="password" hint="(mínimo 8 caracteres)">Senha</Label>
          <PasswordField id="password" name="password" required minLength={8} maxLength={128} autoComplete="new-password" aria-describedby={describedBy} />
        </div>
        <div>
          <Label htmlFor="confirm">Repita a senha</Label>
          <PasswordField id="confirm" name="confirm" required minLength={8} maxLength={128} autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="accessCode" hint="(fornecido pelo administrador)">Código de acesso</Label>
          <input id="accessCode" name="accessCode" required autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} className={authInput} />
        </div>
        <FormError state={state} id="signup-error" />
        <SubmitButton pending={pending} pendingLabel="Criando conta…">Criar conta</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm font-semibold text-muted">
        Já tem conta? <Link href="/login" className="font-extrabold text-crimson-ink hover:underline">Entrar</Link>
      </p>
    </>
  );
}
