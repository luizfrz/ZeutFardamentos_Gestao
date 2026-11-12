"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const HEADER_COLOR = { light: "#0c1844", dark: "#050921" } as const;

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", HEADER_COLOR[theme]));
}

/** Mantido sempre montado no cabeçalho: sincroniza o tema do sistema e o theme-color. A escolha em si fica no menu do perfil. */
export function ThemeSync() {
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
  return null;
}

function choose(theme: "light" | "dark") {
  applyTheme(theme);
  try { localStorage.setItem("theme", theme); } catch {}
}

/** Escolha Claro/Escuro. O destaque vem do CSS (dark:), então não diverge entre servidor e cliente. */
export function ThemeSwitch() {
  const base = "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors";
  return (
    <div className="flex gap-1 rounded-xl bg-navy-soft p-1" role="group" aria-label="Aparência">
      <button type="button" onClick={() => choose("light")} className={`${base} bg-surface text-ink shadow-sm dark:bg-transparent dark:text-muted`}><Sun size={16} />Claro</button>
      <button type="button" onClick={() => choose("dark")} className={`${base} text-muted dark:bg-surface dark:text-ink dark:shadow-sm`}><Moon size={16} />Escuro</button>
    </div>
  );
}
