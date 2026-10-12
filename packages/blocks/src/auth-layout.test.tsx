import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { AuthLayout } from "./auth-layout";

describe("AuthLayout", () => {
  test("uses the logo fallback in both panels when branding is present", () => {
    render(<AuthLayout title="Login" logo={<span>Brand logo</span>} brandDescription="Brand description"><span>Form</span></AuthLayout>);
    expect(screen.getAllByText("Brand logo")).toHaveLength(2);
    expect(screen.getByText("Brand description")).toBeInTheDocument();
  });
  test("uses a distinct compact logo with branding and without it", () => {
    const { rerender } = render(<AuthLayout title="Login" logo={<span>Desktop logo</span>} compactLogo={<span>Compact logo</span>} brandFeatures={[{ label: "Feature", icon: <span>Feature icon</span> }]}><span>Form</span></AuthLayout>);
    expect(screen.getByText("Desktop logo")).toBeInTheDocument();
    expect(screen.getByText("Compact logo")).toBeInTheDocument();
    expect(screen.getByText("Feature icon")).toBeInTheDocument();
    rerender(<AuthLayout title="Login" compactLogo={<span>Compact logo</span>} brandFeatures={[]}><span>Form</span></AuthLayout>);
    expect(screen.getByText("Compact logo")).toBeInTheDocument();
    expect(screen.queryByText("Feature")).toBeNull();
    rerender(<AuthLayout title="Login" logo={<span>Fallback logo</span>}><span>Form</span></AuthLayout>);
    expect(screen.getByText("Fallback logo")).toBeInTheDocument();
  });
  test("footer-only branding renders without a logo or headline", () => {
    render(<AuthLayout title="Login" brandFooter="Brand footer"><span>Form</span></AuthLayout>);
    expect(screen.getByText("Brand footer")).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });
  test("renderiza título, descripción y el form (children)", () => {
    render(
      <AuthLayout title="Iniciar sesión" description="Accedé con tu usuario">
        <button type="button">Ingresar</button>
      </AuthLayout>
    );
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByText("Accedé con tu usuario")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  test("renderiza el panel de marca cuando hay headline/features/footer", () => {
    render(
      <AuthLayout
        title="Iniciar sesión"
        brandHeadline="Del dictado al informe firmado"
        brandFeatures={[{ label: "Dictado por voz" }, { label: "Firma trazable" }]}
        brandFooter="entorno de demostración"
      >
        <span>form</span>
      </AuthLayout>
    );
    expect(
      screen.getByRole("heading", { name: "Del dictado al informe firmado" })
    ).toBeInTheDocument();
    expect(screen.getByText("Dictado por voz")).toBeInTheDocument();
    expect(screen.getByText("entorno de demostración")).toBeInTheDocument();
  });

  test("renderiza el footer del panel de contenido", () => {
    render(
      <AuthLayout title="Login" footer={<span>Sesión protegida</span>}>
        <span>form</span>
      </AuthLayout>
    );
    expect(screen.getByText("Sesión protegida")).toBeInTheDocument();
  });
});
