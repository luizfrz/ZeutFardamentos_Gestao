"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const HEADER_COLOR = { light: "#0c1844", dark: "#050921" } as const;

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", HEADER_COLOR[theme]));
}

/**
 * Alterna claro/escuro. O tema inicial (preferência salva ou do sistema) é aplicado por um script
 * no <head> antes da pintura; aqui só trocamos e guardamos a escolha. Os dois ícones são renderizados
 * sempre e escondidos por CSS, então não há divergência entre servidor e cliente.
 */
export function ThemeToggle() {
  useEffect(() => {
    // Sem escolha salva, acompanha mudanças do tema do sistema.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try { if (localStorage.getItem("theme")) return; } catch {}
      applyTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light"); // sincroniza o theme-color
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar entre modo claro e escuro"
      title="Alternar tema"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-11 sm:w-11"
    >
      <Moon size={18} className="dark:hidden" />
      <Sun size={18} className="hidden dark:block" />
    </button>
  );
}
