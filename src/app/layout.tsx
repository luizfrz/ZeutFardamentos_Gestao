import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zeut · Fardamentos e Confecções",
  description: "Gestão de encomendas, clientes e responsáveis da Zeut Fardamentos.",
  applicationName: "Zeut",
  appleWebApp: { capable: true, title: "Zeut", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0c1844" },
    { media: "(prefers-color-scheme: dark)", color: "#050921" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Roda antes da pintura: aplica o tema salvo (ou o do sistema) e evita o "flash" de tema errado.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={nunito.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
