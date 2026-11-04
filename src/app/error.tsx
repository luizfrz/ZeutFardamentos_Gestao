"use client";

import { ServerCrash } from "lucide-react";
import { useEffect } from "react";
import { Button, Card } from "@/components/ui";
import { API_URL } from "@/lib/api-core";

/** Fallback de erro de rota (ex.: API ou banco fora do ar). O header continua visível. */
export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto mt-10 max-w-xl p-10 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-crimson-soft text-crimson-ink">
        <ServerCrash size={28} />
      </div>
      <h1 className="text-2xl font-extrabold">Não foi possível carregar os dados</h1>
      <p className="mt-2 leading-relaxed text-muted">
        A API pode estar fora do ar ou sem acesso ao banco de dados. Confira se ela está rodando em{" "}
        <code className="rounded bg-navy-soft px-1.5 py-0.5 text-sm font-bold text-ink">{API_URL}</code> e tente novamente.
      </p>
      <Button className="mt-6" onClick={() => retry()}>Tentar novamente</Button>
    </Card>
  );
}
