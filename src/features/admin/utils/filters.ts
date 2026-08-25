export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function includesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return normalizeSearch(haystack).includes(normalizeSearch(query));
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; page: number; pageSize: number; pages: number } {
  const safePageSize = Math.max(1, pageSize);
  const pages = Math.max(1, Math.ceil(items.length / safePageSize));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * safePageSize;
  return {
    items: items.slice(start, start + safePageSize),
    total: items.length,
    page: safePage,
    pageSize: safePageSize,
    pages,
  };
}

export function sortBy<T>(
  items: T[],
  getValue: (item: T) => string | number,
  direction: "asc" | "desc" = "asc",
): T[] {
  const sorted = [...items].sort((a, b) => {
    const va = getValue(a);
    const vb = getValue(b);
    if (va < vb) return direction === "asc" ? -1 : 1;
    if (va > vb) return direction === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}
