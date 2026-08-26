/** Normalização textual compartilhada (busca loja / admin). */

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function textIncludes(haystack: string, needle: string): boolean {
  const n = normalizeText(needle);
  if (!n) return true;
  return normalizeText(haystack).includes(n);
}
