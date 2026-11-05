"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cx } from "@/lib/cn";

/** Link da barra superior com destaque quando a rota atual é a dele. */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const active = usePathname().startsWith(href);
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={cx("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/15", active && "bg-white/15")}>
      {children}
    </Link>
  );
}
