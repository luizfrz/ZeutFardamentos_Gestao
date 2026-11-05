import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { ToastProvider } from "@/components/ui";
import { AdminNav } from "@/features/auth/admin-nav";
import { UserMenu } from "@/features/auth/user-menu";

/** Área logada: cabeçalho + conteúdo. Páginas de login ficam em (auth), sem este cabeçalho. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="h-20 bg-header" />}>
        <Header
          adminNav={<Suspense fallback={null}><AdminNav /></Suspense>}
          userMenu={<Suspense fallback={null}><UserMenu /></Suspense>}
        />
      </Suspense>
      <main className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 sm:px-10">{children}</main>
    </ToastProvider>
  );
}
