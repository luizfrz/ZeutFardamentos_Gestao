import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cn";

export function StepTitle({ n, title, subtitle }: { n: number; title: string; subtitle?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-xs font-extrabold text-white">{n}</span>
      <div>
        <h2 className="text-xl font-extrabold leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

export function ChecklistItem({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <li className={cx("flex items-center gap-2.5 text-sm font-semibold", ok ? "text-muted" : "text-crimson")}>
      <span className={cx("grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2", ok ? "border-ok bg-ok text-white" : "border-crimson bg-crimson-soft")}>
        {ok && <Check size={13} strokeWidth={3.5} />}
      </span>{children}
    </li>
  );
}
