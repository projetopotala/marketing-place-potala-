export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
}

export function isSameDay(iso: string, reference = new Date()): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

export function isSameMonth(iso: string, reference = new Date()): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

export function daysAgoIso(days: number, reference = new Date()): string {
  const date = new Date(reference);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function inRange(iso: string, from?: string, to?: string): boolean {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;
  if (from && time < new Date(from).getTime()) return false;
  if (to && time > new Date(to).getTime()) return false;
  return true;
}

export function nowIso(): string {
  return new Date().toISOString();
}
