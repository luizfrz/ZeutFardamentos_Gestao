"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";
import { control } from "@/components/ui/fields";
import { cx } from "@/lib/cn";

/** Campo de senha com botão "mostrar/ocultar" acessível (aria-pressed). */
export function PasswordField({ invalid, reveal, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; reveal?: boolean }) {
  const [shown, setVisible] = useState(false);
  const visible = shown || Boolean(reveal);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} aria-invalid={invalid || undefined} spellCheck={false} autoCapitalize="none"
        className={cx(control, "pr-12", invalid ? "border-crimson bg-crimson-soft" : "border-slate/70", className)} />
      <button type="button" onClick={() => setVisible(!visible)} aria-pressed={visible} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-navy-soft hover:text-ink">
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
