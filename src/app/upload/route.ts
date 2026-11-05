import { put } from "@vercel/blob";
import { apiBase } from "@/lib/api-server";
import { getToken } from "@/lib/session";

const MAX_BYTES = 4 * 2 ** 20; // a Vercel limita o corpo da requisição a ~4,5 MB; o navegador já reduz a foto antes
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });


export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return json({ message: "Origem não permitida." }, 403);

  const token = await getToken();
  if (!token) return json({ message: "Faça login para continuar." }, 401);
  try {
    const me = await fetch(`${apiBase()}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!me.ok) return json({ message: "Sessão expirada. Entre novamente." }, 401);
  } catch {
    return json({ message: "Não foi possível conectar à API." }, 502);
  }

  const storeId = process.env.IMG_STORE_ID ?? process.env.BLOB_STORE_ID;
  const blobToken = process.env.IMG_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!storeId && !blobToken) return json({ message: "Armazenamento de imagens não configurado (IMG_STORE_ID ou BLOB_READ_WRITE_TOKEN)." }, 503);

  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return json({ message: "Envie uma imagem." }, 400);
  const ext = TYPES[file.type];
  if (!ext) return json({ message: "Use uma imagem PNG, JPG ou WebP." }, 415);
  if (file.size > MAX_BYTES) return json({ message: "Imagem muito grande (máximo 4 MB)." }, 413);

  const { url } = await put(`orders/photo.${ext}`, file, { access: "public", addRandomSuffix: true, contentType: file.type, ...(blobToken ? { token: blobToken } : { storeId }) });
  return json({ url }, 201);
}
