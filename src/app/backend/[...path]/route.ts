import { cookies } from "next/headers";
import { apiBase } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/token";

/**
 * Ponte entre o navegador e a API: anexa o token do cookie httpOnly. Assim o token nunca fica acessível ao JavaScript
 * da página e o navegador só conversa com o próprio domínio (sem CORS).
 */
async function forward(req: Request, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await ctx.params;
  const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

  // login/cadastro têm rotas próprias (Server Actions); nunca repassar /auth/* por aqui
  if (path[0] === "auth") return json({ message: "Não encontrado." }, 404);

  // Defesa contra CSRF: requisições que alteram dados só valem se vierem do próprio site
  if (!["GET", "HEAD"].includes(req.method)) {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) return json({ message: "Origem não permitida." }, 403);
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return json({ message: "Faça login para continuar.", code: "UNAUTHORIZED" }, 401);

  const target = `${apiBase()}/${path.map(encodeURIComponent).join("/")}${new URL(req.url).search}`;
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": req.headers.get("content-type") ?? "application/json" },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return json({ message: "Não foi possível conectar à API." }, 502);
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
