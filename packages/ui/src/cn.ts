/**
 * Merge de clases con dedup tailwind (clsx + tailwind-merge). Es el mismo `cn`
 * que usa HeroUI internamente (re-exportado de `tailwind-variants`, dependency
 * directa de la lib) — un único punto en vez de copias locales ad-hoc.
 */
export { cn } from "tailwind-variants";
