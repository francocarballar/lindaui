/**
 * Formateadores genéricos sobre `Intl` — sin acoplar dominio ni país. Para
 * formatos telefónicos locales específicos, el consumidor debe envolver
 * `formatPhone` o resolverlo aparte.
 */

export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
}

export function formatCurrency(value: number, options?: FormatCurrencyOptions): string {
  const { currency = "USD", locale = "es" } = options ?? {};
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function formatDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
  locale = "es",
): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(
    locale,
    options ?? { day: "2-digit", month: "2-digit", year: "numeric" },
  ).format(d);
}

/**
 * Agrupa dígitos de a 3 (preservando un `+` inicial). Es un formateo
 * genérico de legibilidad, no un formateador E.164 por país.
 */
export function formatPhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;
  const groups = digits.match(/.{1,3}/g) ?? [digits];
  return (hasPlus ? "+" : "") + groups.join(" ");
}
