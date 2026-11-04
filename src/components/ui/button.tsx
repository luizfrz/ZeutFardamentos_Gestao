import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "navy";
const variants: Record<Variant, string> = {
  primary: "bg-crimson text-white hover:bg-crimson-dark disabled:bg-crimson/45 disabled:hover:bg-crimson/45",
  navy: "bg-navy text-white hover:bg-navy/90",
  outline: "border-2 border-navy bg-surface text-ink hover:bg-navy-soft/60 disabled:opacity-50",
  ghost: "text-ink hover:bg-navy-soft/60",
};
const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-bold transition-colors disabled:cursor-not-allowed";

export function Button({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={cx(base, variants[variant], className)} {...p} />;
}
export function ButtonLink({ variant = "primary", className, href, children }: { variant?: Variant; className?: string; href: string; children: ReactNode }) {
  return <Link href={href} className={cx(base, variants[variant], className)}>{children}</Link>;
}
