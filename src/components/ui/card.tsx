import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cn";

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-2xl border border-line bg-white shadow-[0_1px_3px_rgba(11,20,69,.06)]", className)} {...p} />;
}
export function CardTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return <h2 className="flex items-center gap-2.5 text-xl font-extrabold">{icon}{children}</h2>;
}
