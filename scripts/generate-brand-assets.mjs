// Gera todos os arquivos de marca (web, PWA, favicon) a partir das logos originais em /brand.
// Uso: npm run brand:build   (requer o pacote "sharp")
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const BRAND = { navy: "#0c1844", crimson: "#c80036", cream: "#fff5e1", coral: "#ff6969" };
const FULL = "brand/zeut-logo-completa.png"; // marca completa, fundo transparente
const AVATAR = "brand/zeut-avatar.png"; //      perfil quadrado, fundo creme
mkdirSync("public/brand", { recursive: true });
mkdirSync("public/icons", { recursive: true });

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const log = (file, bytes, note = "") => console.log(`  ✔ ${file.padEnd(34)} ${kb(bytes).padStart(9)}  ${note}`);

// 1) Marca completa (fundo transparente). No tema escuro ela aparece sobre um selo creme (ver AuthShell), então basta uma versão.
const W = 440;
let o = await sharp(FULL).resize({ width: W }).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile("public/brand/logo-full.webp");
log("public/brand/logo-full.webp", o.size, `${o.width}×${o.height}`);

// 2) Avatar (cabeçalho 48px → 2x) e arte do painel de login
o = await sharp(AVATAR).resize(128, 128).webp({ quality: 90, effort: 6 }).toFile("public/brand/avatar-128.webp");
log("public/brand/avatar-128.webp", o.size, "cabeçalho");
o = await sharp(AVATAR).resize(960, 960).webp({ quality: 72, effort: 6 }).toFile("public/brand/login-art.webp");
log("public/brand/login-art.webp", o.size, "painel do login (desktop)");

// 3) PWA / favicon (PNG sem transparência, como exigem iOS/Android)
const png = { compressionLevel: 9, palette: false };
o = await sharp(AVATAR).resize(192, 192).flatten({ background: BRAND.cream }).png(png).toFile("public/icons/icon-192.png");
log("public/icons/icon-192.png", o.size);
o = await sharp(AVATAR).resize(512, 512).flatten({ background: BRAND.cream }).png(png).toFile("public/icons/icon-512.png");
log("public/icons/icon-512.png", o.size);
// maskable: o sistema recorta até ~20% das bordas, então a arte fica a 78% do tamanho sobre fundo creme
const inner = await sharp(AVATAR).resize(400, 400).png().toBuffer();
o = await sharp({ create: { width: 512, height: 512, channels: 3, background: BRAND.cream } })
  .composite([{ input: inner, gravity: "center" }]).png(png).toFile("public/icons/icon-maskable-512.png");
log("public/icons/icon-maskable-512.png", o.size, "zona segura");
o = await sharp(AVATAR).resize(180, 180).flatten({ background: BRAND.cream }).png(png).toFile("src/app/apple-icon.png");
log("src/app/apple-icon.png", o.size, "iOS");
o = await sharp(AVATAR).resize(64, 64).flatten({ background: BRAND.cream }).png({ ...png, palette: true, quality: 90 }).toFile("src/app/icon.png");
log("src/app/icon.png", o.size, "favicon 64px");
console.log("\nCores da marca:", BRAND);
