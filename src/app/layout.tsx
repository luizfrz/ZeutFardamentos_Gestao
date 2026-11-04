import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zeut · Fardamentos e Confecções",
  description: "Gestão de encomendas, clientes e responsáveis da Zeut Fardamentos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body className="min-h-screen">
        <Suspense fallback={<div className="h-20 bg-navy" />}>
          <Header />
        </Suspense>
        <main className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-8 sm:px-10">{children}</main>
      </body>
    </html>
  );
}
