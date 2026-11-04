import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zeut · Fardamentos e Confecções",
    short_name: "Zeut",
    description: "Gestão de encomendas, clientes e responsáveis da Zeut Fardamentos.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff4e0",
    theme_color: "#0b1445",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Novo pedido", short_name: "Novo pedido", url: "/orders/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Novo cadastro", short_name: "Cadastro", url: "/register", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
