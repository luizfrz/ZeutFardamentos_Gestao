import { WifiOff } from "lucide-react";

export const metadata = { title: "Sem conexão · Zeut" };

/** Exibida pelo Service Worker quando não há rede. Sem JS próprio: funciona só com o HTML/CSS em cache. */
export default function OfflinePage() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-line bg-surface p-10 text-center shadow-[0_1px_3px_rgba(11,20,69,.06)]">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-amber-soft text-ink">
        <WifiOff size={28} />
      </div>
      <h1 className="text-2xl font-extrabold">Você está sem conexão</h1>
      <p className="mt-2 leading-relaxed text-muted">
        Os pedidos e cadastros são carregados ao vivo, então é preciso estar online. Verifique sua internet e tente novamente.
      </p>
      {/* <a> de propósito: força uma navegação completa (esta página é servida no lugar de outra URL pelo Service Worker) */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="mt-6 inline-flex rounded-xl bg-crimson px-5 py-3 text-[15px] font-bold text-white hover:bg-crimson-dark">
        Tentar novamente
      </a>
    </div>
  );
}
