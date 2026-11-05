const MAX_SIDE = 1280; // o card mostra ~600 px em tela retina e o detalhe ~560 px: 1280 mantém nitidez com folga
const MIN_SIDE = 960; // abaixo disso o card (retina) começaria a perder nitidez: a compressão nunca reduz mais que isto
const TARGET_BYTES = 150 * 1024;

const toBlob = (c: HTMLCanvasElement, type: string, q: number) => new Promise<Blob | null>((ok) => c.toBlob(ok, type, q));

/**
 * Comprime a foto no navegador antes de enviar: lado maior ≤ 1280 px, WebP (JPEG nos navegadores que não geram WebP),
 * baixando a qualidade aos poucos até ficar em ~150 KB. Assim o bucket ocupa pouco e a imagem continua nítida no card.
 */
export async function shrinkImage(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  let scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  let best: Blob | null = null;
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.fillStyle = "#fff"; // PNG com fundo transparente vira branco
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      for (const q of [0.8, 0.72, 0.65, 0.58, 0.5]) {
        let blob = await toBlob(canvas, "image/webp", q);
        if (blob?.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", q); // sem suporte a WebP
        if (!blob) return file;
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= TARGET_BYTES) return asFile(blob, file.name);
      }
      // Ainda grande (foto muito detalhada): reduz um pouco as dimensões e tenta de novo, sem passar do piso
      const next = scale * 0.85;
      if (Math.max(bmp.width, bmp.height) * next < MIN_SIDE) break;
      scale = next;
    }
  } finally {
    bmp.close();
  }
  // Nunca devolve algo maior que o original
  return best && best.size < file.size ? asFile(best, file.name) : file;
}

const asFile = (blob: Blob, name: string) => new File([blob], name.replace(/\.\w+$/, "") + (blob.type === "image/webp" ? ".webp" : ".jpg"), { type: blob.type });

/** Envia uma foto (já reduzida) e devolve o endereço público dela. */
export async function uploadImage(file: File): Promise<string> {
  const small = await shrinkImage(file);
  const body = new FormData();
  body.set("file", small);
  const res = await fetch("/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!res.ok || !data.url) throw new Error(data.message ?? "Não foi possível enviar a imagem.");
  return data.url;
}
