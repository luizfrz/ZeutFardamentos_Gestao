import { NextResponse, type NextRequest } from "next/server";
import { decodeToken, NEXT_COOKIE, safeNext, SESSION_COOKIE } from "@/lib/token";

/** Páginas que não exigem login. (Arquivos estáticos e /backend ficam fora via `matcher`.) */
const PUBLIC_PAGES = new Set(["/login", "/offline", "/session-expired"]);

/**
 * Checagem "otimista" de sessão: só olha o cookie (existe e não expirou). Quem protege os DADOS de verdade é a API,
 * que valida a assinatura do token em toda chamada.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = decodeToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !PUBLIC_PAGES.has(pathname)) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    // Lembra para onde a pessoa queria ir; o login volta para lá.
    res.cookies.set(NEXT_COOKIE, safeNext(pathname + search), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
    return res;
  }
  // Já logado e abrindo o login: vai para o painel (exceto quando veio de "sessão expirada").
  if (session && pathname === "/login" && !req.nextUrl.searchParams.has("expired")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // Tudo, exceto: assets do Next, a ponte /backend e qualquer arquivo com extensão (ícones, manifest, sw.js, imagens…)
  matcher: ["/((?!_next/static|_next/image|backend|.*\\..*).*)"],
};
