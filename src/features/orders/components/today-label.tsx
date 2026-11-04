import { connection } from "next/server";
import { Suspense } from "react";
import { formatLongToday } from "@/lib/format";

const SUFFIX = "ordenadas por prioridade (prazo + quantidade)";

async function TodayText() {
  await connection();
  return <>{formatLongToday()} · {SUFFIX}</>;
}

export function TodayLabel() {
  return (
    <p className="mt-1 text-base font-semibold text-muted" suppressHydrationWarning>
      <Suspense fallback={`Ordenadas por prioridade (prazo + quantidade)`}>
        <TodayText />
      </Suspense>
    </p>
  );
}
