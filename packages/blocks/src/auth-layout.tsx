"use client";
import type { ReactNode } from "react";

// Block: shell de autenticación split-screen. Panel de marca (solo desktop,
// fondo oscuro estilo `viewer`) + panel de contenido (logo compacto en mobile,
// título, descripción, slot para el form y footer). Mobile-first: stackea, el
// panel de marca se oculta y aparece el logo compacto. API por slots, genérica
// (sin acoplar dominio); el `children` recibe el form (ej. <LoginForm/>).

export interface AuthFeature {
  icon?: ReactNode;
  label: string;
}

export interface AuthLayoutProps {
  /** Marca (logo) del panel de marca (desktop). */
  logo?: ReactNode;
  /** Logo compacto del panel de contenido (mobile). Si no se pasa, usa `logo`. */
  compactLogo?: ReactNode;
  /** Contenido del panel de marca (solo desktop). Si no hay headline ni
   *  features, el panel de marca se omite y queda solo el form centrado. */
  brandHeadline?: ReactNode;
  brandDescription?: ReactNode;
  brandFeatures?: AuthFeature[];
  brandFooter?: ReactNode;
  /** Panel de contenido. */
  title: ReactNode;
  description?: ReactNode;
  /** Nota al pie del panel de contenido (ej. "sesión protegida"). */
  footer?: ReactNode;
  /** El formulario u otro contenido de auth. */
  children: ReactNode;
}

export function AuthLayout({
  logo,
  compactLogo,
  brandHeadline,
  brandDescription,
  brandFeatures,
  brandFooter,
  title,
  description,
  footer,
  children,
}: AuthLayoutProps) {
  const hasBrand =
    brandHeadline != null ||
    brandDescription != null ||
    (brandFeatures != null && brandFeatures.length > 0) ||
    brandFooter != null;

  return (
    <div
      className={
        hasBrand
          ? "flex min-h-dvh flex-col lg:grid lg:grid-cols-[1.05fr_0.95fr]"
          : "flex min-h-dvh flex-col"
      }
    >
      {/* Panel de marca: solo desktop */}
      {hasBrand && (
        <div
          className="relative hidden flex-col justify-between bg-viewer-bg p-12 text-viewer-foreground lg:flex"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, color-mix(in oklch, var(--viewer-foreground) 3%, transparent) 0 2px, transparent 2px 13px)",
          }}
        >
          {logo && <div className="flex items-center gap-2.5">{logo}</div>}

          <div className="max-w-md">
            {brandHeadline && (
              <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                {brandHeadline}
              </h1>
            )}
            {brandDescription && (
              <p className="mt-4 text-sm leading-relaxed opacity-70">{brandDescription}</p>
            )}
            {brandFeatures && brandFeatures.length > 0 && (
              <div className="mt-7 flex gap-6">
                {brandFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm opacity-80">
                    {f.icon}
                    {f.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {brandFooter ? (
            <p className="text-xs opacity-40">{brandFooter}</p>
          ) : (
            <span aria-hidden />
          )}
        </div>
      )}

      {/* Panel de contenido */}
      <div className="flex flex-1 flex-col justify-between p-6 pt-[max(env(safe-area-inset-top),2rem)] lg:justify-center lg:p-10 lg:pb-10">
        <div className="mx-auto w-full max-w-[360px]">
          {/* Logo compacto del panel de contenido. Con panel de marca: solo en
              mobile (desktop ya lo tiene en la marca). Sin marca: siempre. */}
          {(compactLogo ?? logo) && hasBrand && (
            <div className="mb-10 flex items-center gap-2.5 lg:hidden">
              {compactLogo ?? logo}
            </div>
          )}
          {(compactLogo ?? logo) && !hasBrand && (
            <div className="mb-10 flex items-center gap-2.5">{compactLogo ?? logo}</div>
          )}

          <h2 className="mb-1.5 text-[28px] font-semibold tracking-tight lg:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mb-7 text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </div>

        {footer && (
          <div className="mx-auto mt-10 flex w-full max-w-[360px] items-center justify-center gap-1.5 text-xs text-muted-foreground lg:mt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
