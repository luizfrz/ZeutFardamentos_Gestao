import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { UserMenu } from "@/features/auth/user-menu";

/** Área logada: cabeçalho + conteúdo. Páginas de login ficam em (auth), sem este cabeçalho. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={<div className="h-20 bg-header" />}>
        <Header userMenu={<Suspense fallback={null}><UserMenu /></Suspense>} />
      </Suspense>
      <main className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 sm:px-10">{children}</main>
    </>
  );
}
