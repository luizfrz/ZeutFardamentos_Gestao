import { AlertTriangle, Check, ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cn";

export function Field({ label, required, hint, error, children, className }: {
  label: string; required?: boolean; hint?: ReactNode; error?: string | false | null; children: ReactNode; className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-extrabold">{label}{required && <span className="ml-0.5 text-crimson-ink">*</span>}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs font-semibold text-crimson-ink">{error}</span>
        : hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const control = "w-full rounded-xl border bg-surface px-3.5 py-3 text-[15px] font-semibold outline-none transition-colors placeholder:font-normal placeholder:text-subtle focus:border-navy focus:ring-2 focus:ring-navy/25";

export function Input({ invalid, valid, icon, className, ...p }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; valid?: boolean; icon?: ReactNode }) {
  return (
    <div className="relative">
      <input
        className={cx(control, invalid ? "border-crimson bg-crimson-soft text-crimson-ink" : valid ? "border-ok" : "border-slate/70", !!icon && "pr-11", className)}
        {...p}
      />
      {(icon || invalid || valid) && (
        <span className={cx("pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2", invalid ? "text-crimson-ink" : valid ? "text-ok-ink" : "text-muted")}>
          {invalid ? <AlertTriangle size={18} /> : valid ? <Check size={18} /> : icon}
        </span>
      )}
    </div>
  );
}
export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cx(control, "appearance-none border-slate/70 pr-10", className)} {...p}>{children}</select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink" />
    </div>
  );
}
export function Textarea({ invalid, className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cx(control, "min-h-28 resize-y", invalid ? "border-crimson bg-crimson-soft" : "border-slate/70", className)} {...p} />;
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="grid h-5 w-5 place-items-center rounded-md border-2 border-navy bg-surface text-white peer-checked:bg-navy peer-focus-visible:ring-2 peer-focus-visible:ring-navy/40">
        {checked && <Check size={13} strokeWidth={3.5} />}
      </span>
      {children}
    </label>
  );
}

export function Segmented<T extends string>({ value, onChange, options, fill }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: ReactNode }[];
  /** Abas dividem a largura toda; no celular ícone acima do texto. */
  fill?: boolean;
}) {
  return (
    <div role="tablist" className={cx("gap-1 rounded-xl bg-navy-soft p-1", fill ? "flex w-full" : "inline-flex max-w-full flex-wrap")}>
      {options.map((o) => (
        <button
          key={o.value} type="button" role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
          className={cx("flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors", fill && "min-w-0 flex-1 flex-col justify-center px-1.5 text-center text-xs leading-tight sm:flex-row sm:px-4 sm:text-sm",
            value === o.value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink")}
        >{o.icon}{o.label}</button>
      ))}
    </div>
  );
}
