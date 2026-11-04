// Sem caracteres ambíguos (0/O, 1/l/I) para ditar ou digitar sem erro.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Senha aleatória de 16 caracteres (~93 bits), gerada no navegador com o gerador seguro do sistema. */
export function generatePassword(length = 16): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
}
