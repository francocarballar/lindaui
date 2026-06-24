// Helpers de búsqueda resiliente para filtrar listas. Acompañan al
// `search-field` (input) — éste solo emite el string; el matching vive acá.
//
// `normalizeText`: minúsculas + sin acentos/diacríticos (NFD + strip de
// combining marks U+0300–U+036F) + trim. Así "José", "JOSÉ" y "jose" colapsan
// al mismo token y mayúsculas/tildes no rompen el match. (Nota: la ñ se
// normaliza a "n" — habitual y deseable para búsqueda tolerante.)
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * ¿`query` matchea `haystack`? Normaliza ambos lados antes de comparar por
 * substring. Query vacío → true (no filtra). Usar en el `.filter()` del
 * consumidor: `items.filter((it) => matchesSearch(it.nombre, query))`.
 */
export function matchesSearch(haystack: string, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;
  return normalizeText(haystack).includes(q);
}
