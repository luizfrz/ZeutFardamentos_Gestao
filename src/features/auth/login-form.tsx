"use client";

import { Suspense, useActionState } from "react";
import { loginAction, type AuthState } from "./actions";
import { authInput, FormError, Label, SubmitButton, useAutoFocus } from "./form-parts";
import { PasswordField } from "./password-field";
import { SessionNotice } from "./session-notice";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, {});
  const emailRef = useAutoFocus<HTMLInputElement>();
  const hasError = Boolean(state.error || state.errors);

  return (
    <>
      <Suspense fallback={null}><SessionNotice /></Suspense>
      <form action={action} className="space-y-5">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <input ref={emailRef} id="email" name="email" type="email" required defaultValue={state.values?.email}
            autoComplete="username" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
            aria-invalid={hasError || undefined} aria-describedby={hasError ? "login-error" : undefined} className={authInput} placeholder="voce@empresa.com" />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <PasswordField id="password" name="password" required autoComplete="current-password" invalid={hasError}
            aria-describedby={hasError ? "login-error" : undefined} placeholder="Sua senha" />
        </div>
        <FormError state={state} id="login-error" />
        <SubmitButton pending={pending} pendingLabel="Entrando…">Entrar</SubmitButton>
      </form>
    </>
  );
}
