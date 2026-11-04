import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/token";

/** Chamada quando a API recusa o token (expirado/inválido): limpa o cookie e leva ao login. */
export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login?expired=1", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
