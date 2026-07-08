/**
 * Helpers de fecha para vistas de tipo chat (dividers, timestamps). `Intl`
 * nativo — sin dependencia de `dayjs`. Todos aceptan `Date | number | string`.
 */

function toDate(value: Date | number | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date | number | string): boolean {
  return isSameDay(toDate(date), new Date());
}

export function isYesterday(date: Date | number | string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(toDate(date), yesterday);
}

/** `HH:mm` en el locale dado (default `es`). */
export function formatShortTime(date: Date | number | string, locale = "es"): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
    toDate(date),
  );
}

/**
 * "Hoy" / "Ayer" / fecha corta (`DD/MM`, o `DD/MM/AAAA` si no es el año
 * actual). Pensado para dividers de conversación. Etiquetas fijas en español
 * (igual que el origen); el formato numérico se arma a mano (`padStart`) en
 * vez de `Intl` — el 2-digit de `Intl.DateTimeFormat` no zero-pads de forma
 * consistente entre builds ICU para todos los locales.
 */
export function formatRelativeTime(date: Date | number | string): string {
  const d = toDate(date);
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return sameYear ? `${day}/${month}` : `${day}/${month}/${d.getFullYear()}`;
}
